import './App.css';
import React, { useReducer } from 'react';
import { PDFViewer, Document, Page, View, Canvas, Text } from '@react-pdf/renderer';
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";

Date.prototype.addDays = function (days) {
  var date = new Date(this);
  date.setDate(date.getDate() + days);
  return date;
}
Date.prototype.addMonths = function (months) {
  var date = new Date(this);
  date.setMonth(date.getMonth() + months);
  return date;
}

function drawCalendar(painter, xMax, yMax, month) {
  const dayHeaderHeight = 20
  const availableHeight = yMax - (dayHeaderHeight)
  const availableWidth = xMax
  const xStep = availableWidth / 7

  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0) // Get last day of month using this trick: https://stackoverflow.com/a/1184359
  const totalDays = month.getDay() + lastDay.getDate()
  const rows = Math.ceil(totalDays / 7)
  const yStep = availableHeight / rows

  // Paint vertical lines
  for (let i = 0; i <= 7; i++) {
    painter
      .moveTo(xStep * i, 0)
      .lineTo(xStep * i, dayHeaderHeight + (rows * yStep))
      .stroke()
  }
  // Paint top horizontal line
  painter
    .moveTo(0, 0)
    .lineTo(xStep * 7, 0)
    .stroke()
  // Paint horizontal lines
  for (let i = 0; i <= rows; i++) {
    let y = dayHeaderHeight + (i * yStep)
    painter
      .moveTo(0, y)
      .lineTo(xStep * 7, y)
      .stroke()
  }
  // Paint weekday names
  for (let i = 0; i < 7; i++) {
    const dayName = new Date(Date.UTC(2017, 0, 2)).addDays(i).toLocaleDateString('default', { weekday: 'long' })
    painter.fontSize(12).text(dayName, xStep * i + 5, 5)
  }
  // Get start of first week even if it's not in the current month
  let startDate = new Date(month.valueOf())
  while (startDate.getDay() > 0) {
    startDate.setDate(startDate.getDate() - 1)
  }
  // Paint dates
  for (let d = 0; d < 7 * rows; d++) {
    const date = startDate.addDays(d)
    if (date.getMonth() != month.getMonth()) {
      painter.fillColor("#DCDCDC")
    }
    painter.text(date.getDate().toString(), (d % 7) * xStep + 5, dayHeaderHeight + (Math.floor(d / 7) * yStep) + 5)
    painter.fillColor("black")
  }
}

function getFirstOfMonth() {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function getMonthList(start, end) {
  let months = []
  let curMonth = start
  while (curMonth <= end) {
    months.push(new Date(curMonth))
    curMonth = curMonth.addMonths(1)
  }
  return months;
}

const formDefaults = {
  startMonth: getFirstOfMonth(),
  endMonth: getFirstOfMonth()
}

function App() {
  const formReducer = (prevState, { value, key }) => { return { ...prevState, [key]: value }; }
  const [state, dispatch] = useReducer(formReducer, formDefaults)

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-content">
          <h1>Simple Calendar</h1>
          <label htmlFor='startMonth'>From</label>
          <DatePicker
            id="startMonth"
            selected={state.startMonth}
            startDate={state.startMonth}
            endDate={state.endMonth}
            onChange={start => dispatch({ value: start, key: 'startMonth' })}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            showFullMonthYearPicker
            showTwoColumnMonthYearPicker
            selectsStart
          />
          <label htmlFor='endMonth'>To</label>
          <DatePicker
            id="endMonth"
            selected={state.endMonth}
            startDate={state.startMonth}
            endDate={state.endMonth}
            onChange={end => dispatch({ value: end, key: 'endMonth' })}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            showFullMonthYearPicker
            showTwoColumnMonthYearPicker
            selectsEnd
            filterDate={d => d >= state.startMonth}
          />
        </div>
        <a className="sidebar-footer" href="https://jondegn.com">jondegn.com</a>
      </div>
      <PDFViewer className="main">
        <Document>
          <Page style={{ padding: 36 }} size="letter" orientation='landscape'>
            {getMonthList(state.startMonth, state.endMonth).map(m => {
              return (<View>
                <Text style={{
                  fontSize: 24,
                  textAlign: 'center',
                  marginBottom: 6
                }}>{`${m.toLocaleDateString('default', { month: 'long' })} ${m.getFullYear()}`}</Text>
                <Canvas
                  style={{ width: 720, height: 540 - 33 }}
                  paint={(painter, availableWidth, availableHeight) => drawCalendar(painter, availableWidth, availableHeight, m)}
                />
              </View>)
            })}
          </Page>
        </Document>
      </PDFViewer>
    </div>
  );
}

export default App;
