import logo from './logo.svg';
import './App.css';
import React, { useReducer, useEffect } from 'react';
import { PDFViewer, Document, Page, View, Canvas, Text } from '@react-pdf/renderer';
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";

Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

function debounce(fn, ms) {
  let timer
  return _ => {
    clearTimeout(timer)
    timer = setTimeout(_ => {
      timer = null
      fn.apply(this, arguments)
    }, ms)
  };
}

function drawCalendar(painter, xMax, yMax, monthDate) {

  const monthHeaderHeight = 25
  const dayHeaderHeight = 20
  const availableHeight = yMax - (dayHeaderHeight + monthHeaderHeight)
  const availableWidth = xMax
  const xStep = availableWidth / 7

  // Paint month header
  painter.fontSize(24).text(`${monthDate.toLocaleDateString('default', { month: 'long' })} ${monthDate.getFullYear()}`).restore()

  const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0) // Get last day of month using this trick: https://stackoverflow.com/a/1184359
  const totalDays = monthDate.getDay() + lastDay.getDate()
  const rows = Math.ceil(totalDays / 7)
  const yStep = availableHeight / rows

  // Paint vertical lines
  for (let i = 0; i <= 7; i++) {
    painter
      .moveTo(xStep * i, monthHeaderHeight)
      .lineTo(xStep * i, dayHeaderHeight + monthHeaderHeight + (rows * yStep))
      .stroke()
  }
  // Paint top horizontal line
  painter
    .moveTo(0, monthHeaderHeight)
    .lineTo(xStep * 7, monthHeaderHeight)
    .stroke()
  // Paint horizontal lines
  for (let i = 0; i <= rows; i++) {
    let y = dayHeaderHeight + monthHeaderHeight + (i * yStep)
    painter
      .moveTo(0, y)
      .lineTo(xStep * 7, y)
      .stroke()
  }
  // Paint weekday names
  for (let i = 0; i < 7; i++) {
    const dayName = new Date(Date.UTC(2017, 0, 2)).addDays(i).toLocaleDateString('default', { weekday: 'long' })
    painter.fontSize(12).text(dayName, xStep * i + 5, monthHeaderHeight + 5)
  }
  // Get start of first week even if it's not in the current month
  let startDate = new Date(monthDate.valueOf())
  while (startDate.getDay() > 0) {
    startDate.setDate(startDate.getDate() - 1)
  }
  // Paint dates
  for (let d = 0; d < 7 * rows; d++) {
    const date = startDate.addDays(d)
    if (date.getMonth() != monthDate.getMonth()) {
      painter.fillColor("#DCDCDC")
    }
    painter.text(date.getDate().toString(), (d % 7) * xStep + 5, monthHeaderHeight + dayHeaderHeight + (Math.floor(d / 7) * yStep) + 5)
    painter.fillColor("black")
  }
}

function getFirstOfMonth() {
  const d = new Date()
  d.setDate(1)
  return d
}

const formDefaults = {
  monthDate: getFirstOfMonth()
}

function App() {
  const formReducer = (prevState, { value, key }) => { return { ...prevState, [key]: value }; }
  const [state, dispatch] = useReducer(formReducer, formDefaults)
  const [dimensions, setDimensions] = React.useState({
    height: window.innerHeight,
    width: window.innerWidth
  })

  // https://www.pluralsight.com/guides/re-render-react-component-on-window-resize
  useEffect(() => {
    const debouncedHandleResize = debounce(function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth
      })
    }, 100)

    window.addEventListener('resize', debouncedHandleResize)

    return _ => {
      window.removeEventListener('resize', debouncedHandleResize)
    }
  })

  return (
    <div className="App">
      <h1>Simple Calendar</h1>
      <div>
        <PDFViewer height={dimensions.height * .7} width={dimensions.width * .9}>
          <Document>
            <Page style={{ padding: 36 }} size="letter" orientation='landscape'>
              <View>
                {/* <Text style={{
                  fontSize: 24,
                  textAlign: 'center'
                }}>{`${state.monthDate.toLocaleDateString('default', { month: 'long' })} ${state.monthDate.getFullYear()}`}</Text> */}
                <Canvas
                // debug={true}
                  style={{ width: 720, height: 540 }}
                  paint={(painter, availableWidth, availableHeight) => {
                    drawCalendar(painter, availableWidth, availableHeight, state.monthDate)
                  }}
                />
              </View>
            </Page>
          </Document>
        </PDFViewer>
      </div>
      <label htmlFor='monthDate'>Month</label>
      <DatePicker
        id="monthDate"
        selected={state.monthDate}
        onChange={date => {
          dispatch({ value: date, key: 'monthDate' })
          console.log(date)
        }}
        dateFormat="MMMM yyyy"
        showMonthYearPicker
        showFullMonthYearPicker
      />
    </div>
  );
}

export default App;
