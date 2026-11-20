'use client';

export default function AdminPage() {
  const peakHours = [
    { hour: '09:00', bookings: 38, width: '38%' },
    { hour: '11:00', bookings: 98, width: '82%' },
    { hour: '13:00', bookings: 89, width: '74%' },
    { hour: '15:00', bookings: 118, width: '98%' },
    { hour: '17:00', bookings: 82, width: '68%' },
    { hour: '19:00', bookings: 42, width: '35%' },
  ];

  const hoggedSeats = [
    { seat: 'F1-05', breakTime: '2h 45m', notCheckedIn: '45m', timeouts: 8 },
    { seat: 'F1-12', breakTime: '2h 10m', notCheckedIn: '35m', timeouts: 6 },
    { seat: 'F2-08', breakTime: '1h 55m', notCheckedIn: '30m', timeouts: 5 },
    { seat: 'F1-22', breakTime: '1h 40m', notCheckedIn: '25m', timeouts: 5 },
    { seat: 'F3-04', breakTime: '1h 25m', notCheckedIn: '20m', timeouts: 4 },
  ];

  return (
    <div>
      <h1>Admin</h1>
      <p style={{ color: '#6b7280', margin: '0 0 16px 0', fontSize: '14px' }}>
        Library occupancy trends and seat hogging analytics.
      </p>

      {/* Panel "Peak hours": a plain table (Hour, Bookings) with 6 mock rows and a horizontal bar */}
      <div className="panel">
        <div className="panel-header">Peak hours</div>
        <div className="panel-body">
          <table>
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Hour</th>
                <th style={{ width: '140px' }}>Bookings</th>
                <th>Volume bar</th>
              </tr>
            </thead>
            <tbody>
              {peakHours.map((row) => (
                <tr key={row.hour}>
                  <td>{row.hour}</td>
                  <td>{row.bookings} students</td>
                  <td>
                    <div
                      style={{
                        width: row.width,
                        background: '#1d4ed8',
                        height: '14px',
                        borderRadius: '2px',
                      }}
                    ></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel "Hogged seats" */}
      <div className="panel">
        <div className="panel-header">Hogged seats</div>
        <div className="panel-body">
          {/* One line above it defining "hogged" */}
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#4b5563' }}>
            A seat is considered hogged if it has frequent auto-release timeouts or an excessive ratio of break/unconfirmed time to total held time.
          </p>

          {/* Table with columns: Seat, Time on break, Booked not checked in, Timeouts. 5 mock rows. */}
          <table>
            <thead>
              <tr>
                <th>Seat</th>
                <th>Time on break</th>
                <th>Booked not checked in</th>
                <th>Timeouts</th>
              </tr>
            </thead>
            <tbody>
              {hoggedSeats.map((row) => (
                <tr key={row.seat}>
                  <td style={{ fontWeight: 'bold' }}>{row.seat}</td>
                  <td>{row.breakTime}</td>
                  <td>{row.notCheckedIn}</td>
                  <td>{row.timeouts} times</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
