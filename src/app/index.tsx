import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function MyPageScreen() {
  const [viewMode, setViewMode] = useState<'subject' | 'daily'>('subject'); // 表示モードの状態
  const [weekOffset, setWeekOffset] = useState(0); // 週のオフセット（0=今週、-1=先週、1=来週）
  const [dailyDetailVisible, setDailyDetailVisible] = useState(false); // 日別詳細モーダルの表示状態
  const [selectedDate, setSelectedDate] = useState(''); // 選択された日付
  const [subjectDetailVisible, setSubjectDetailVisible] = useState(false); // 科目別詳細モーダルの表示状態
  const [selectedSubject, setSelectedSubject] = useState(''); // 選択された科目
  const [subjectsData, setSubjectsData] = useState([
    {
      label: '国語',
      studyRecords: [
        { date: '2024-01-15', hours: 5, content: '古文の読解練習' },
        { date: '2024-01-16', hours: 3, content: '漢文の句法' },
      ],
    },
    {
      label: '数学',
      studyRecords: [
        { date: '2024-01-15', hours: 6, content: '二次関数のグラフ' },
        { date: '2024-01-16', hours: 4, content: '三角関数の公式' },
      ],
    },
    {
      label: '英語',
      studyRecords: [
        { date: '2024-01-15', hours: 4, content: '関係代名詞の練習' },
      ],
    },
    {
      label: '理科',
      studyRecords: [{ date: '2024-01-15', hours: 3, content: '化学反応式' }],
    },
    {
      label: '社会',
      studyRecords: [
        { date: '2024-01-15', hours: 2, content: '日本史の江戸時代' },
      ],
    },
    {
      label: '音楽',
      studyRecords: [{ date: '2024-01-15', hours: 0, content: '' }],
    },
    {
      label: '美術',
      studyRecords: [
        { date: '2024-01-15', hours: 2.5, content: 'デッサンの練習' },
      ],
    },
    {
      label: '体育',
      studyRecords: [
        { date: '2024-01-15', hours: 4.5, content: 'バスケットボール' },
      ],
    },
  ]);

  const maxYAxisHours = useMemo(() => {
    const maxTotalHours = Math.max(
      0,
      ...subjectsData.map((s) =>
        s.studyRecords.reduce((sum, r) => sum + r.hours, 0)
      )
    );
    let max;
    if (maxTotalHours <= 10) {
      max = 10;
    } else if (maxTotalHours <= 100) {
      // 100以下の場合、10ずつ上がる
      const steps = Math.ceil((maxTotalHours - 10) / 10);
      max = 10 + steps * 10;
    } else if (maxTotalHours <= 200) {
      max = 200;
    } else {
      // 200以上の場合、50上がるごとに50増える
      const steps = Math.ceil((maxTotalHours - 200) / 50);
      max = 200 + steps * 50;
    }
    console.log(
      'maxYAxisHours calculated:',
      max,
      'maxTotalHours:',
      maxTotalHours,
      'from subjectsData:',
      subjectsData
    );
    return max;
  }, [subjectsData]);

  // 指定された週の日付範囲を計算
  const getWeekDates = (offset: number = 0) => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=日曜日, 1=月曜日, ..., 6=土曜日
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + offset * 7); // 指定された週の日曜日
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // 指定された週の土曜日

    return {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0],
    };
  };

  // 日別データの計算（指定された週のデータのみ）
  const dailyData = useMemo(() => {
    const dateMap = new Map();
    const weekRange = getWeekDates(weekOffset);

    // 全ての勉強記録を日付ごとに集計（今週のデータのみ）
    subjectsData.forEach((subject) => {
      subject.studyRecords.forEach((record) => {
        const date = record.date;
        // 今週の範囲内のデータのみを対象
        if (date >= weekRange.start && date <= weekRange.end) {
          if (dateMap.has(date)) {
            dateMap.set(date, dateMap.get(date) + record.hours);
          } else {
            dateMap.set(date, record.hours);
          }
        }
      });
    });

    // 今週の7日間のデータを作成（勉強時間がない日は0h）
    const weekData = [];
    const startDate = new Date(weekRange.start);
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];
      const totalHours = dateMap.get(dateString) || 0;
      weekData.push({ date: dateString, totalHours });
    }

    return weekData;
  }, [subjectsData, weekOffset]);

  // 選択された日の科目データを計算
  const selectedDateSubjects = useMemo(() => {
    if (!selectedDate) return [];

    return subjectsData
      .map((subject) => {
        const record = subject.studyRecords.find(
          (r) => r.date === selectedDate
        );
        return record
          ? {
              label: subject.label,
              hours: record.hours,
              content: record.content || '',
            }
          : null;
      })
      .filter((item) => item !== null && item.hours > 0)
      .sort((a, b) => b.hours - a.hours); // 勉強時間の多い順にソート
  }, [selectedDate, subjectsData]);

  // 選択された科目の勉強内容データを計算
  const selectedSubjectContents = useMemo(() => {
    if (!selectedSubject) return [];

    const subject = subjectsData.find((s) => s.label === selectedSubject);
    if (!subject) return [];

    // 勉強内容ごとに時間を集計
    const contentMap = new Map();

    subject.studyRecords.forEach((record) => {
      if (record.content && record.content.trim()) {
        // 改行で区切られた複数の勉強内容を処理
        const contents = record.content.split('\n').filter((c) => c.trim());
        contents.forEach((content) => {
          const trimmedContent = content.trim();
          if (contentMap.has(trimmedContent)) {
            contentMap.set(
              trimmedContent,
              contentMap.get(trimmedContent) + record.hours
            );
          } else {
            contentMap.set(trimmedContent, record.hours);
          }
        });
      }
    });

    // 配列に変換して時間の多い順にソート
    return Array.from(contentMap.entries())
      .map(([content, totalHours]) => ({ content, totalHours }))
      .sort((a, b) => b.totalHours - a.totalHours);
  }, [selectedSubject, subjectsData]);

  // 日別表示用のmaxYAxisHours
  const dailyMaxYAxisHours = useMemo(() => {
    const maxDailyHours = Math.max(0, ...dailyData.map((d) => d.totalHours));
    let max;
    if (maxDailyHours <= 10) {
      max = 10;
    } else if (maxDailyHours <= 100) {
      const steps = Math.ceil((maxDailyHours - 10) / 10);
      max = 10 + steps * 10;
    } else if (maxDailyHours <= 200) {
      max = 200;
    } else {
      const steps = Math.ceil((maxDailyHours - 200) / 50);
      max = 200 + steps * 50;
    }
    return max;
  }, [dailyData]);

  // データ変更を監視
  useEffect(() => {
    console.log('subjectsData changed:', subjectsData);
  }, [subjectsData]);

  // Y軸のラベルとグリッドラインを生成
  const generateYAxisLabels = () => {
    const labels = [];
    const gridLines = [];
    const graphHeight = 400; // グラフの高さ
    const startPosition = 0; // グラフの開始位置
    const baseValue =
      maxYAxisHours <= 10
        ? 10
        : maxYAxisHours <= 20
        ? 20
        : maxYAxisHours <= 50
        ? 50
        : maxYAxisHours <= 100
        ? 100
        : Math.max(maxYAxisHours, 200);

    const step = baseValue / 5;
    const values = [0, step, step * 2, step * 3, step * 4, baseValue];
    values.forEach((value) => {
      // グラフの高さに合わせて位置を計算（下から上へ）
      // maxYAxisHoursを使用して棒グラフと同じ計算式にする
      const position =
        startPosition +
        (-18 +
          graphHeight -
          (value /
            (maxYAxisHours <= 10
              ? 10
              : maxYAxisHours <= 20
              ? 20
              : maxYAxisHours <= 50
              ? 50
              : maxYAxisHours <= 100
              ? 100
              : Math.max(maxYAxisHours, 200))) *
            graphHeight);
      labels.push({
        value: value,
        position: position,
      });
      if (value > 0) {
        gridLines.push({
          position: position,
        });
      }
    });
    return { labels, gridLines };
  };

  // 日別表示用のY軸ラベル生成
  const generateDailyYAxisLabels = () => {
    const labels = [];
    const gridLines = [];
    const graphHeight = 400;
    const startPosition = 0;
    const baseValue = dailyMaxYAxisHours;

    const values = [];
    if (baseValue <= 10) {
      for (let i = 0; i <= 10; i += 2) {
        values.push(i);
      }
    } else if (baseValue <= 100) {
      for (let i = 0; i <= baseValue; i += 10) {
        values.push(i);
      }
    } else if (baseValue <= 200) {
      for (let i = 0; i <= 200; i += 20) {
        values.push(i);
      }
    } else {
      for (let i = 0; i <= baseValue; i += 50) {
        values.push(i);
      }
    }

    values.forEach((value) => {
      const position =
        startPosition + (-18 + graphHeight - (value / baseValue) * graphHeight);
      labels.push({
        value: value,
        position: position,
      });
      if (value > 0) {
        gridLines.push({
          position: position,
        });
      }
    });
    return { labels, gridLines };
  };

  const yAxisData = generateYAxisLabels();

  const [addVisible, setAddVisible] = useState(false);
  const [addLabel, setAddLabel] = useState('');
  const [addHours, setAddHours] = useState('');
  const [addContent, setAddContent] = useState(''); // 勉強内容
  const [addMode, setAddMode] = useState<'existing' | 'new'>('existing');
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState<
    number | null
  >(null);

  // 日付入力を年、月、日に分ける
  const [addYear, setAddYear] = useState(String(new Date().getFullYear()));
  const [addMonth, setAddMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, '0')
  );
  const [addDay, setAddDay] = useState(
    String(new Date().getDate()).padStart(2, '0')
  );

  const openAdd = () => {
    setAddLabel('');
    setAddHours('');
    setAddContent('');
    setAddMode('existing');
    setSelectedSubjectIndex(null);

    // 現在の日付を初期値に設定
    const now = new Date();
    setAddYear(String(now.getFullYear()));
    setAddMonth(String(now.getMonth() + 1).padStart(2, '0'));
    setAddDay(String(now.getDate()).padStart(2, '0'));

    setAddVisible(true);
  };
  const closeAdd = () => setAddVisible(false);

  const confirmAdd = () => {
    let label = addLabel.trim();
    const hours = parseFloat(addHours);

    // 既存科目を選択している場合は、選択された科目の名前を使用
    if (addMode === 'existing' && selectedSubjectIndex !== null) {
      label = subjectsData[selectedSubjectIndex].label;
    }

    // 日付を構築
    const dateString = `${addYear}-${addMonth}-${addDay}`;

    console.log('Adding time:', {
      label,
      hours,
      dateString,
      addMode,
      selectedSubjectIndex,
    });

    // バリデーション
    if (addMode === 'existing' && selectedSubjectIndex === null) {
      console.log('既存科目が選択されていません');
      setAddVisible(false);
      return;
    }
    if (addMode === 'new' && !label) {
      console.log('新規科目の名前が入力されていません');
      setAddVisible(false);
      return;
    }
    if (isNaN(hours) || hours < 0) {
      console.log('無効な時間です:', hours);
      setAddVisible(false);
      return;
    }

    if (addMode === 'existing' && selectedSubjectIndex !== null) {
      setSubjectsData((prev) => {
        const next = [...prev];
        const subject = next[selectedSubjectIndex];
        const existingRecordIndex = subject.studyRecords.findIndex(
          (r) => r.date === dateString
        );

        if (existingRecordIndex >= 0) {
          // 既存の日付の記録に時間を加算
          subject.studyRecords[existingRecordIndex].hours += hours;
          // 勉強内容も追加（既存の内容がある場合は改行で追加）
          if (addContent.trim()) {
            const existingContent =
              subject.studyRecords[existingRecordIndex].content || '';
            subject.studyRecords[existingRecordIndex].content = existingContent
              ? `${existingContent}\n${addContent.trim()}`
              : addContent.trim();
          }
        } else {
          // 新しい日付の記録を追加
          subject.studyRecords.push({
            date: dateString,
            hours,
            content: addContent.trim() || '',
          });
        }

        console.log('Updated existing subject:', next[selectedSubjectIndex]);
        return next;
      });
    } else {
      setSubjectsData((prev) => {
        const idx = prev.findIndex((p) => p.label === label);
        if (idx >= 0) {
          const next = [...prev];
          const subject = next[idx];
          const existingRecordIndex = subject.studyRecords.findIndex(
            (r) => r.date === dateString
          );

          if (existingRecordIndex >= 0) {
            // 既存の日付の記録に時間を加算
            subject.studyRecords[existingRecordIndex].hours += hours;
            // 勉強内容も追加（既存の内容がある場合は改行で追加）
            if (addContent.trim()) {
              const existingContent =
                subject.studyRecords[existingRecordIndex].content || '';
              subject.studyRecords[existingRecordIndex].content =
                existingContent
                  ? `${existingContent}\n${addContent.trim()}`
                  : addContent.trim();
            }
          } else {
            // 新しい日付の記録を追加
            subject.studyRecords.push({
              date: dateString,
              hours,
              content: addContent.trim() || '',
            });
          }

          console.log('Updated existing subject by name:', next[idx]);
          return next;
        }
        // 新規科目を作成
        const newData = [
          ...prev,
          {
            label,
            studyRecords: [
              {
                date: dateString,
                hours,
                content: addContent.trim() || '',
              },
            ],
          },
        ];
        console.log('Created new subject:', newData[newData.length - 1]);
        return newData;
      });
    }
    setAddVisible(false);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fb" />
      {/* ヘッダー */}
      <View style={styles.headerShadow}>
        <View style={styles.header}>
          <Text style={styles.headerText}>マイページ</Text>
        </View>
      </View>
      {/* タブ */}
      <View style={styles.tabRow}>
        <View style={styles.tabContainer}>
          <View style={styles.tabButtonActive}>
            <Text style={styles.tabActive}>勉強時間</Text>
          </View>
          <Link href="/todo" asChild>
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.tabButtonInactive}
            >
              <Text style={styles.tabInactive}>TODOリスト</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
      {/* グラフエリア */}
      <View style={styles.graphArea}>
        <View style={styles.viewModeSelector}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'subject' && styles.viewModeButtonActive,
            ]}
            onPress={() => setViewMode('subject')}
          >
            <Text
              style={[
                styles.viewModeButtonText,
                viewMode === 'subject' && styles.viewModeButtonTextActive,
              ]}
            >
              科目別
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'daily' && styles.viewModeButtonActive,
            ]}
            onPress={() => setViewMode('daily')}
          >
            <Text
              style={[
                styles.viewModeButtonText,
                viewMode === 'daily' && styles.viewModeButtonTextActive,
              ]}
            >
              日別
            </Text>
          </TouchableOpacity>
        </View>

        {/* 週の切り替えボタン（日別表示時のみ） */}
        {viewMode === 'daily' && (
          <View style={styles.weekSelector}>
            <TouchableOpacity
              style={styles.weekButton}
              onPress={() => setWeekOffset(weekOffset - 1)}
            >
              <MaterialIcons name="chevron-left" size={24} color="#5c6bc0" />
            </TouchableOpacity>
            <Text style={styles.weekLabel}>
              {(() => {
                const weekRange = getWeekDates(weekOffset);
                const startDate = new Date(weekRange.start);
                const endDate = new Date(weekRange.end);
                return `${startDate.getMonth() + 1}/${startDate.getDate()} - ${
                  endDate.getMonth() + 1
                }/${endDate.getDate()}`;
              })()}
            </Text>
            <TouchableOpacity
              style={[
                styles.weekButton,
                weekOffset >= 0 && styles.weekButtonDisabled,
              ]}
              onPress={() => weekOffset < 0 && setWeekOffset(weekOffset + 1)}
              disabled={weekOffset >= 0}
            >
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={weekOffset >= 0 ? '#ccc' : '#5c6bc0'}
              />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.chartRow}>
          {/* 縦軸 */}
          <View style={styles.yAxis}>
            {(viewMode === 'subject'
              ? yAxisData
              : generateDailyYAxisLabels()
            ).labels.map((label, index) => (
              <View
                key={index}
                style={[styles.yAxisLabelContainer, { top: label.position }]}
              >
                <Text style={styles.yAxisLabel}>{label.value}h </Text>
              </View>
            ))}
            <View style={styles.yAxisLine} />
          </View>
          {/* 棒グラフ */}
          <ScrollView
            style={{ maxHeight: 650 }}
            contentContainerStyle={styles.barGraphArea}
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={false}
          >
            <View
              style={{
                height: viewMode === 'daily' ? 445 : 500,
                justifyContent: 'flex-end',
                position: 'relative',
              }}
            >
              {/* グリッドライン */}
              <View style={styles.gridContainer} pointerEvents="none">
                {(viewMode === 'subject'
                  ? yAxisData
                  : generateDailyYAxisLabels()
                ).gridLines.map((line, index) => (
                  <View
                    key={index}
                    style={[styles.gridLine, { top: line.position }]}
                  />
                ))}
              </View>
              <View
                style={[
                  styles.barGraph,
                  { height: viewMode === 'daily' ? 400 : 400 },
                ]}
              >
                {viewMode === 'subject'
                  ? subjectsData.map((item, i) => {
                      const totalHours = item.studyRecords.reduce(
                        (sum, r) => sum + r.hours,
                        0
                      );
                      const height =
                        totalHours > 0
                          ? Math.max(
                              2,
                              (totalHours /
                                (maxYAxisHours <= 10
                                  ? 10
                                  : maxYAxisHours <= 20
                                  ? 20
                                  : maxYAxisHours <= 50
                                  ? 50
                                  : maxYAxisHours <= 100
                                  ? 100
                                  : Math.max(maxYAxisHours, 200))) *
                                400
                            )
                          : 0;
                      console.log(
                        `Graph rendering - ${item.label}: totalHours=${totalHours}, height=${height}, maxYAxisHours=${maxYAxisHours}`
                      );
                      return (
                        <View key={i} style={styles.barGroup}>
                          <Text style={styles.barHours}>{totalHours}h</Text>
                          <TouchableOpacity
                            style={[styles.bar, { height }]}
                            onPress={() => {
                              setSelectedSubject(item.label);
                              setSubjectDetailVisible(true);
                            }}
                            disabled={totalHours === 0}
                          />
                          <Text style={styles.barLabel}>{item.label}</Text>
                        </View>
                      );
                    })
                  : dailyData.map((item, i) => {
                      const height =
                        item.totalHours > 0
                          ? Math.max(
                              2,
                              (item.totalHours / dailyMaxYAxisHours) * 400
                            )
                          : 0;
                      const dateObj = new Date(item.date);
                      const dayOfWeek = [
                        '日',
                        '月',
                        '火',
                        '水',
                        '木',
                        '金',
                        '土',
                      ][dateObj.getDay()];
                      const dateLabel = `${
                        dateObj.getMonth() + 1
                      }/${dateObj.getDate()}(${dayOfWeek})`;
                      return (
                        <View key={i} style={styles.barGroup}>
                          <Text style={styles.barHours}>
                            {item.totalHours}h
                          </Text>
                          <TouchableOpacity
                            style={[styles.bar, { height }]}
                            onPress={() => {
                              setSelectedDate(item.date);
                              setDailyDetailVisible(true);
                            }}
                            disabled={item.totalHours === 0}
                          />
                          <Text style={styles.barLabel}>{dateLabel}</Text>
                        </View>
                      );
                    })}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
      <View style={styles.bottomArea}>
        <View style={styles.bottomLine} />
        <View style={styles.bottomAs}>
          <View style={styles.bottomItem}>
            <MaterialIcons name="bar-chart" size={28} color="#333" />
            <Text style={styles.bottomLabel}>勉強時間</Text>
          </View>
          <View style={styles.bottomDivider} />
          <TouchableOpacity style={styles.bottomItem} onPress={openAdd}>
            <MaterialIcons name="add-circle-outline" size={28} color="#333" />
            <Text style={styles.bottomLabel}>時間の追加</Text>
          </TouchableOpacity>
          <View style={styles.bottomDivider} />
          <View style={styles.bottomItem}>
            <Ionicons name="search" size={28} color="#333" />
            <Text style={styles.bottomLabel}>検索</Text>
          </View>
          <View style={styles.bottomDivider} />
          <View style={styles.bottomItem}>
            <MaterialIcons name="people-outline" size={28} color="#333" />
            <Text style={styles.bottomLabel}>フレンド</Text>
          </View>
        </View>
        {/* 追加モーダル */}
        <Modal
          visible={addVisible}
          transparent
          animationType="fade"
          onRequestClose={closeAdd}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingContainer}
            >
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>勉強時間を追加</Text>

                {/* 選択肢 */}
                <View style={styles.choiceRow}>
                  <TouchableOpacity
                    style={[
                      styles.choiceBtn,
                      addMode === 'existing' && styles.choiceBtnActive,
                    ]}
                    onPress={() => setAddMode('existing')}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        addMode === 'existing' && styles.choiceTextActive,
                      ]}
                    >
                      既存科目の更新
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.choiceBtn,
                      addMode === 'new' && styles.choiceBtnActive,
                    ]}
                    onPress={() => setAddMode('new')}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        addMode === 'new' && styles.choiceTextActive,
                      ]}
                    >
                      新規科目の追加
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 既存科目更新 */}
                {addMode === 'existing' && (
                  <>
                    <View style={styles.dropdownContainer}>
                      <Text style={styles.dropdownLabel}>科目を選択</Text>
                      <ScrollView style={styles.dropdown} nestedScrollEnabled>
                        {subjectsData.map((subject, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.dropdownItem,
                              selectedSubjectIndex === index &&
                                styles.dropdownItemSelected,
                            ]}
                            onPress={() => setSelectedSubjectIndex(index)}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                selectedSubjectIndex === index &&
                                  styles.dropdownItemTextSelected,
                              ]}
                            >
                              {subject.label} (
                              {subject.studyRecords.reduce(
                                (sum, r) => sum + r.hours,
                                0
                              )}
                              h)
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    {/* 日付入力（年、月、日） */}
                    <View style={styles.dateInputContainer}>
                      <Text style={styles.dateInputLabel}>日付</Text>
                      <View style={styles.dateInputRow}>
                        <TextInput
                          style={[styles.dateInput, styles.yearInput]}
                          placeholder="年"
                          keyboardType="numeric"
                          value={addYear}
                          onChangeText={setAddYear}
                          maxLength={4}
                        />
                        <Text style={styles.dateInputSeparator}>年</Text>
                        <TextInput
                          style={[styles.dateInput, styles.monthInput]}
                          placeholder="月"
                          keyboardType="numeric"
                          value={addMonth}
                          onChangeText={setAddMonth}
                          maxLength={2}
                        />
                        <Text style={styles.dateInputSeparator}>月</Text>
                        <TextInput
                          style={[styles.dateInput, styles.dayInput]}
                          placeholder="日"
                          keyboardType="numeric"
                          value={addDay}
                          onChangeText={setAddDay}
                          maxLength={2}
                        />
                        <Text style={styles.dateInputSeparator}>日</Text>
                      </View>
                    </View>
                    <TextInput
                      style={[styles.modalInput, { marginTop: 8 }]}
                      placeholder="追加する時間（h）"
                      keyboardType="numeric"
                      value={addHours}
                      onChangeText={setAddHours}
                      returnKeyType="done"
                      onSubmitEditing={confirmAdd}
                    />
                    <TextInput
                      style={[styles.modalInput, { marginTop: 8 }]}
                      placeholder="勉強内容（使用した参考書や、勉強した範囲など）"
                      value={addContent}
                      onChangeText={setAddContent}
                      multiline={true}
                      numberOfLines={3}
                    />
                  </>
                )}

                {/* 新規科目追加 */}
                {addMode === 'new' && (
                  <>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="科目名"
                      value={addLabel}
                      onChangeText={setAddLabel}
                    />
                    {/* 日付入力（年、月、日） */}
                    <View style={styles.dateInputContainer}>
                      <Text style={styles.dateInputLabel}>日付</Text>
                      <View style={styles.dateInputRow}>
                        <TextInput
                          style={[styles.dateInput, styles.yearInput]}
                          placeholder="年"
                          keyboardType="numeric"
                          value={addYear}
                          onChangeText={setAddYear}
                          maxLength={4}
                        />
                        <Text style={styles.dateInputSeparator}>年</Text>
                        <TextInput
                          style={[styles.dateInput, styles.monthInput]}
                          placeholder="月"
                          keyboardType="numeric"
                          value={addMonth}
                          onChangeText={setAddMonth}
                          maxLength={2}
                        />
                        <Text style={styles.dateInputSeparator}>月</Text>
                        <TextInput
                          style={[styles.dateInput, styles.dayInput]}
                          placeholder="日"
                          keyboardType="numeric"
                          value={addDay}
                          onChangeText={setAddDay}
                          maxLength={2}
                        />
                        <Text style={styles.dateInputSeparator}>日</Text>
                      </View>
                    </View>
                    <TextInput
                      style={[styles.modalInput, { marginTop: 8 }]}
                      placeholder="時間（h）"
                      keyboardType="numeric"
                      value={addHours}
                      onChangeText={setAddHours}
                      returnKeyType="done"
                      onSubmitEditing={confirmAdd}
                    />
                    <TextInput
                      style={[styles.modalInput, { marginTop: 8 }]}
                      placeholder="勉強内容（使用した参考書や、勉強した範囲など）"
                      value={addContent}
                      onChangeText={setAddContent}
                      multiline={true}
                      numberOfLines={3}
                    />
                  </>
                )}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalCancel]}
                    onPress={closeAdd}
                  >
                    <Text style={styles.modalBtnText}>キャンセル</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalConfirm]}
                    onPress={confirmAdd}
                  >
                    <Text style={styles.modalConfirmText}>追加</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </View>

      {/* 日別詳細モーダル */}
      <Modal
        visible={dailyDetailVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDailyDetailVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate &&
                  new Date(selectedDate).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDailyDetailVisible(false)}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.dailyDetailContent}>
              {selectedDateSubjects.length > 0 ? (
                selectedDateSubjects.map((subject, index) => (
                  <View key={index} style={styles.dailyDetailItem}>
                    <View style={styles.dailyDetailSubjectInfo}>
                      <Text style={styles.dailyDetailSubjectLabel}>
                        {subject.label}
                      </Text>
                      <Text style={styles.dailyDetailHours}>
                        {subject.hours}h
                      </Text>
                    </View>
                    {subject.content && (
                      <Text style={styles.dailyDetailContent}>
                        {subject.content}
                      </Text>
                    )}
                    <View style={styles.dailyDetailProgressBar}>
                      <View
                        style={[
                          styles.dailyDetailProgressFill,
                          {
                            width: `${
                              (subject.hours /
                                Math.max(
                                  ...selectedDateSubjects.map((s) => s.hours)
                                )) *
                              100
                            }%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.dailyDetailEmpty}>
                  <MaterialIcons name="school" size={48} color="#ccc" />
                  <Text style={styles.dailyDetailEmptyText}>
                    この日は勉強記録がありません
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 科目別詳細モーダル */}
      <Modal
        visible={subjectDetailVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSubjectDetailVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedSubject} - 勉強内容別
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSubjectDetailVisible(false)}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.dailyDetailContent}>
              {selectedSubjectContents.length > 0 ? (
                selectedSubjectContents.map((item, index) => (
                  <View key={index} style={styles.dailyDetailItem}>
                    <View style={styles.dailyDetailSubjectInfo}>
                      <Text style={styles.dailyDetailSubjectLabel}>
                        {item.content}
                      </Text>
                      <Text style={styles.dailyDetailHours}>
                        {item.totalHours}h
                      </Text>
                    </View>
                    <View style={styles.dailyDetailProgressBar}>
                      <View
                        style={[
                          styles.dailyDetailProgressFill,
                          {
                            width: `${
                              (item.totalHours /
                                Math.max(
                                  ...selectedSubjectContents.map(
                                    (s) => s.totalHours
                                  )
                                )) *
                              100
                            }%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.dailyDetailEmpty}>
                  <MaterialIcons name="book" size={48} color="#ccc" />
                  <Text style={styles.dailyDetailEmptyText}>
                    この科目の勉強内容記録がありません
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 90, // 下部固定分の余白
  },
  headerShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    backgroundColor: '#f8f9fb',
    borderBottomWidth: 0,
  },
  header: {
    backgroundColor: '#f8f9fb',
    paddingTop: 26,
    paddingBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 84,
    borderBottomWidth: 0,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f1f1f',
    letterSpacing: 0.5,
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#eef1f6',
    padding: 4,
    borderRadius: 999,
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: '#5c6bc0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  tabButtonInactive: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  tabActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  tabInactive: {
    fontSize: 14,
    color: '#5f6368',
    fontWeight: '600',
  },
  graphArea: {
    marginTop: 20,
    alignItems: 'center',
    width: 399, // 7つの項目を399pxに収める
    minHeight: 700, // 高さを調整して400pxのグラフが確実に表示できるように
  },
  graphLabel: {
    color: '#888',
    fontSize: 15,
    marginBottom: 0, // 余白を調整
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: '#eee',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  viewModeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: '#5c6bc0',
  },
  viewModeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  viewModeButtonTextActive: {
    color: '#fff',
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 20,
  },
  weekButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  weekButtonDisabled: {
    backgroundColor: '#f8f8f8',
    opacity: 0.5,
  },
  weekLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 60,
    textAlign: 'center',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 2, // 余白を調整
  },
  yAxis: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 0, // Y軸と棒グラフの隙間を狭く
    marginBottom: 6, // 余白を調整
    height: 400, // グラフの高さに合わせて調整
    justifyContent: 'flex-end',
    width: 40,
    position: 'relative',
  },
  gridContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 400, // グラフの高さに合わせて調整
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#eee',
  },
  yAxisLabelContainer: {
    position: 'absolute',
    right: 10, // Y軸線との間に8pxの空白を追加
    width: 28,
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 12, // ラベルの高さに合わせる
  },
  yAxisLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    textAlign: 'right',
  },
  yAxisLine: {
    width: 1.5,
    height: 400, // グラフの高さに合わせて調整
    backgroundColor: '#888',
    marginBottom: 0,
  },
  barGraphArea: {
    alignItems: 'flex-start',
    minHeight: 200, // 高さを調整
  },
  barGraph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 400, // 高さを調整
    marginBottom: 0,
    justifyContent: 'center',
  },
  barGroup: {
    alignItems: 'center',
    marginHorizontal: 0, // 間隔を調整
  },
  bar: {
    width: 28,
    height: 160, // 高さを調整
    backgroundColor: '#5c6bc0',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barDivider: {
    width: 16,
    height: 180,
    borderLeftWidth: 0,
    marginHorizontal: 10,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: 'auto',
    marginTop: 8,
    backgroundColor: '#fff',
  },
  barLabel: {
    width: 54,
    textAlign: 'center',
    fontSize: 11, // フォントサイズを調整
    color: '#5f6368',
    marginTop: 4, // 余白を調整
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  barHours: {
    fontSize: 11, // フォントサイズを調整
    color: '#5f6368',
    marginBottom: 2, // 余白を調整
    fontWeight: '600',
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  bottomLine: {
    height: 2,
    backgroundColor: '#000',
    width: '100%',
    marginBottom: 0,
  },
  bottomAs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  bottomDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#e0e0e0',
  },
  bottomItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flex: 1,
  },
  bottomIcon: {
    fontSize: 28,
  },
  bottomLabel: {
    fontSize: 13,
    color: '#333',
  },
  // modal styles (reuse from todo.tsx approach)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '95%',
    maxWidth: 800,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1f1f1f',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
    borderRadius: 8,
  },
  modalButtons: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    marginLeft: 8,
  },
  modalCancel: {},
  modalConfirm: {
    backgroundColor: '#1f1f1f',
    borderColor: '#1f1f1f',
  },
  modalBtnText: {
    color: '#1f1f1f',
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmText: {
    color: '#fff',
  },
  choiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 8,
  },
  choiceBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  choiceBtnActive: {
    backgroundColor: '#5c6bc0',
    borderWidth: 1,
    borderColor: '#5c6bc0',
  },
  choiceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5f6368',
  },
  choiceTextActive: {
    color: '#fff',
  },
  dropdownContainer: {
    marginTop: 12,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dropdownLabel: {
    fontSize: 14,
    color: '#5f6368',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdown: {
    maxHeight: 150,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemSelected: {
    backgroundColor: '#e0e0e0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
    color: '#1f1f1f',
  },

  // 日付入力フィールドのスタイル
  dateInputContainer: {
    marginTop: 12,
  },
  dateInputLabel: {
    fontSize: 14,
    color: '#5f6368',
    marginBottom: 8,
    fontWeight: '600',
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    textAlign: 'center',
    minWidth: 60,
  },
  yearInput: {
    flex: 3,
    minWidth: 80,
  },
  monthInput: {
    flex: 2,
    minWidth: 60,
  },
  dayInput: {
    flex: 2,
    minWidth: 60,
  },
  dateInputSeparator: {
    fontSize: 16,
    color: '#5f6368',
    fontWeight: '600',
    marginHorizontal: 4,
  },
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 日別詳細モーダルのスタイル
  dailyDetailContent: {
    maxHeight: 400,
  },
  dailyDetailItem: {
    marginBottom: 16,
  },
  dailyDetailSubjectInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dailyDetailSubjectLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dailyDetailHours: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5c6bc0',
  },
  dailyDetailContent: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 20,
  },
  dailyDetailProgressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  dailyDetailProgressFill: {
    height: '100%',
    backgroundColor: '#5c6bc0',
    borderRadius: 4,
  },
  dailyDetailEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  dailyDetailEmptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
