'use client';

export default function MySeatPage() {
  return (
    <div>
      <h1>My seat</h1>
      <p style={{ color: '#6b7280', margin: '0 0 16px 0', fontSize: '14px' }}>
        View your current reservation, take a break, or release your seat.
      </p>

      {/* A panel "Current booking" */}
      <div className="panel">
        <div className="panel-header">Current booking</div>
        <div className="panel-body">
          {/* Plain two-column table: Seat, Status, Time left */}
          <table style={{ maxWidth: '480px', marginBottom: '16px' }}>
            <tbody>
              <tr>
                <th style={{ width: '140px' }}>Seat</th>
                <td>F1-04</td>
              </tr>
              <tr>
                <th>Status</th>
                <td>Checked in</td>
              </tr>
              <tr>
                <th>Time left</th>
                <td>14m 20s (Break limit: 20m)</td>
              </tr>
            </tbody>
          </table>

          {/* Row of buttons: Check in, Take break, Return from break, Leave seat */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button type="button" className="primary" onClick={() => alert('Already checked in via QR.')}>
              Check in
            </button>
            <button type="button" onClick={() => alert('Break timer started: 20 minutes.')}>
              Take break
            </button>
            <button type="button" onClick={() => alert('Returned from break. Status restored to checked in.')}>
              Return from break
            </button>
            <button type="button" onClick={() => alert('Seat F1-04 released.')}>
              Leave seat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
