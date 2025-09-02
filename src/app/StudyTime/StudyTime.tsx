import React, { useMemo, useState } from 'react';
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
// import DateTimePicker from '@react-native-community/datetimepicker';

export default function MyPageScreen() {
  const [subjectsData, setSubjectsData] = useState([
    {
      label: '国語',
      studyRecords: [
        { date: '2024-01-15', hours: 5 },
        { date: '2024-01-16', hours: 3 },
      ],
    },
    {
      label: '数学',
      studyRecords: [
        { date: '2024-01-15', hours: 6 },
        { date: '2024-01-16', hours: 4 },
      ],
    },
    {
      label: '英語',
      studyRecords: [{ date: '2024-01-15', hours: 4 }],
    },
    {
      label: '理科',
      studyRecords: [{ date: '2024-01-15', hours: 3 }],
    },
    {
      label: '社会',
      studyRecords: [{ date: '2024-01-15', hours: 2 }],
    },
    {
      label: '音楽',
      studyRecords: [{ date: '2024-01-15', hours: 1 }],
    },
    {
      label: '美術',
      studyRecords: [{ date: '2024-01-15', hours: 2.5 }],
    },
    {
      label: '体育',
      studyRecords: [{ date: '2024-01-15', hours: 4.5 }],
    },
  ]);

  const maxYAxisHours = useMemo(
    () =>
      Math.max(
        10,
        ...subjectsData.flatMap((s) => s.studyRecords.map((r) => r.hours))
      ),
    [subjectsData]
  );

  const [addVisible, setAddVisible] = useState(false);
  const [addLabel, setAddLabel] = useState('');
  const [addHours, setAddHours] = useState('');
  const [addMode, setAddMode] = useState<'existing' | 'new'>('existing');
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState<
    number | null
  >(null);
  const [addDate, setAddDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

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
    setAddMode('existing');
    setSelectedSubjectIndex(null);
    setAddDate('');
    setSelectedDate(new Date());

    // 現在の日付を初期値に設定
    const now = new Date();
    setAddYear(String(now.getFullYear()));
    setAddMonth(String(now.getMonth() + 1).padStart(2, '0'));
    setAddDay(String(now.getDate()).padStart(2, '0'));

    setAddVisible(true);
  };
  const closeAdd = () => setAddVisible(false);

  const confirmAdd = () => {
    const label = addLabel.trim();
    const hours = parseFloat(addHours);

    // 日付を構築
    const dateString = `${addYear}-${addMonth}-${addDay}`;

    if (!label || isNaN(hours) || hours < 0) {
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
        } else {
          // 新しい日付の記録を追加
          subject.studyRecords.push({ date: dateString, hours });
        }

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
          } else {
            // 新しい日付の記録を追加
            subject.studyRecords.push({ date: dateString, hours });
          }

          return next;
        }
        // 新規科目を作成
        return [
          ...prev,
          {
            label,
            studyRecords: [{ date: dateString, hours }],
          },
        ];
      });
    }
    setAddVisible(false);
  };

  const handleDateSelect = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setAddDate(`${year}-${month}-${day}`);
    }
  };

  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Adjust to start on Sunday

    const days = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      // Generate 6 weeks (42 days)
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      const isSelected = addDate === formatDate(currentDate); // Uses addDate for selection

      days.push({
        day: currentDate.getDate(),
        month: currentDate.getMonth(),
        year: currentDate.getFullYear(),
        isCurrentMonth,
        isToday,
        isSelected,
      });
    }
    return days;
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
        <Text style={styles.graphLabel}>科目別 / 日別</Text>
        <View style={styles.chartRow}>
          {/* 縦軸 */}
          <View style={styles.yAxis}>
            <Text style={styles.yAxisLabel}>10h</Text>
            <View style={styles.yAxisLine} />
          </View>
          {/* 棒グラフ */}
          <ScrollView
            style={{ maxHeight: 500 }}
            contentContainerStyle={styles.barGraphArea}
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={false}
          >
            <View
              style={{
                height: 300,
                justifyContent: 'flex-end',
                position: 'relative',
              }}
            >
              {/* グリッドライン */}
              <View style={styles.gridContainer} pointerEvents="none">
                <View style={[styles.gridLine, { top: 20 }]} />
                <View style={[styles.gridLine, { top: 80 }]} />
                <View style={[styles.gridLine, { top: 140 }]} />
                <View style={[styles.gridLine, { top: 200 }]} />
              </View>
              <View style={[styles.barGraph, { height: 260 }]}>
                {subjectsData.map((item, i) => {
                  const height = Math.max(
                    2,
                    (item.studyRecords.reduce((sum, r) => sum + r.hours, 0) /
                      maxYAxisHours) *
                      220
                  );
                  return (
                    <View key={i} style={styles.barGroup}>
                      <Text style={styles.barHours}>
                        {item.studyRecords.reduce((sum, r) => sum + r.hours, 0)}
                        h
                      </Text>
                      <View style={[styles.bar, { height }]} />
                      <Text style={styles.barLabel}>{item.label}</Text>
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
        {/* カスタムカレンダー式日付選択モーダル */}
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>日付を選択</Text>
              <View style={styles.calendarContainer}>
                <View style={styles.calendarHeader}>
                  <TouchableOpacity
                    style={styles.calendarNavButton}
                    onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setSelectedDate(newDate);
                    }}
                  >
                    <MaterialIcons name="chevron-left" size={24} color="#666" />
                  </TouchableOpacity>
                  <Text style={styles.calendarMonthText}>
                    {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}
                    月
                  </Text>
                  <TouchableOpacity
                    style={styles.calendarNavButton}
                    onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setSelectedDate(newDate);
                    }}
                  >
                    <MaterialIcons
                      name="chevron-right"
                      size={24}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.calendarGrid}>
                  {['日', '月', '火', '水', '木', '金', '土'].map(
                    (day, index) => (
                      <View key={index} style={styles.calendarDayHeader}>
                        <Text style={styles.calendarDayHeaderText}>{day}</Text>
                      </View>
                    )
                  )}
                  {getCalendarDays(selectedDate).map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.calendarDay,
                        day.isCurrentMonth && styles.calendarDayCurrentMonth,
                        day.isToday && styles.calendarDayToday,
                        day.isSelected && styles.calendarDaySelected,
                      ]}
                      onPress={() => {
                        if (day.isCurrentMonth) {
                          const clickedDate = new Date(
                            day.year,
                            day.month,
                            day.day
                          );
                          const year = clickedDate.getFullYear();
                          const month = String(
                            clickedDate.getMonth() + 1
                          ).padStart(2, '0');
                          const dayNum = String(clickedDate.getDate()).padStart(
                            2,
                            '0'
                          );
                          const formattedDate = `${year}-${month}-${dayNum}`;
                          setAddDate(formattedDate);
                          setShowDatePicker(false);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.calendarDayText,
                          day.isCurrentMonth &&
                            styles.calendarDayTextCurrentMonth,
                          day.isToday && styles.calendarDayTextToday,
                          day.isSelected && styles.calendarDayTextSelected,
                        ]}
                      >
                        {day.day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalCancel]}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.modalBtnText}>キャンセル</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
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
    marginTop: 10,
    alignItems: 'center',
    width: 399, // 7つの項目を399pxに収める
    minHeight: 180, // 高さを調整して7項目が見えるように
  },
  graphLabel: {
    color: '#888',
    fontSize: 15,
    marginBottom: 8, // 余白を調整
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: '#eee',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 2, // 余白を調整
  },
  yAxis: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 6,
    marginBottom: 40, // 余白を調整
    height: 160, // 高さを調整
    justifyContent: 'flex-end',
    width: 40,
  },
  gridContainer: {
    position: 'absolute',
    left: 40,
    right: 0,
    height: 160, // 高さを調整
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#eee',
  },
  yAxisLabel: {
    color: '#888',
    fontSize: 12,
    marginRight: 4,
    marginTop: 8,
    width: 28,
    fontWeight: 'bold',
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    textAlign: 'right',
  },
  yAxisLine: {
    width: 1.5,
    height: 160, // 高さを調整
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
    height: 160, // 高さを調整
    marginBottom: 0,
    justifyContent: 'center',
  },
  barGroup: {
    alignItems: 'center',
    marginHorizontal: 8, // 間隔を調整
  },
  bar: {
    width: 26,
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
    fontSize: 12, // フォントサイズを調整
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
    width: '98%',
    maxWidth: 600,
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
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 8,
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  datePickerButtonSelected: {
    borderColor: '#5c6bc0',
    borderWidth: 1,
  },
  datePickerTextSelected: {
    color: '#5c6bc0',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    marginBottom: 12,
  },
  dateOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  dateOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  calendarContainer: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  calendarNavButton: {
    padding: 5,
  },
  calendarMonthText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDayHeader: {
    width: '14.28%', // 7日間のグリッド
    alignItems: 'center',
    marginBottom: 5,
  },
  calendarDayHeaderText: {
    fontSize: 12,
    color: '#5f6368',
    fontWeight: '600',
  },
  calendarDay: {
    width: '14.28%', // 7日間のグリッド
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginBottom: 5,
  },
  calendarDayCurrentMonth: {
    backgroundColor: '#f0f0f0',
  },
  calendarDayToday: {
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#5c6bc0',
  },
  calendarDaySelected: {
    backgroundColor: '#5c6bc0',
    borderWidth: 1,
    borderColor: '#5c6bc0',
  },
  calendarDayText: {
    fontSize: 14,
    color: '#333',
  },
  calendarDayTextCurrentMonth: {
    color: '#333',
  },
  calendarDayTextToday: {
    color: '#1f1f1f',
    fontWeight: '600',
  },
  calendarDayTextSelected: {
    color: '#fff',
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
});
