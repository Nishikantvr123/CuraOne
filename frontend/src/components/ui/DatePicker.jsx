import React, { useState, useRef, useEffect } from 'react';

const months = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const DatePicker = ({ value, onChange, min, disabled }) => {
  const today = new Date();
  const minDate = min ? new Date(min) : today;
  const parsed = value ? new Date(value) : null;

  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState(parsed || new Date());
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const display = parsed
    ? `${String(parsed.getMonth()+1).padStart(2,'0')}/${String(parsed.getDate()).padStart(2,'0')}/${parsed.getFullYear()}`
    : '';

  const startYear = today.getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => startYear + i);

  const firstDay = new Date(cur.getFullYear(), cur.getMonth(), 1).getDay();
  const totalDays = new Date(cur.getFullYear(), cur.getMonth()+1, 0).getDate();

  const selectDay = (d) => {
    const date = new Date(cur.getFullYear(), cur.getMonth(), d);
    const formatted = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    onChange(formatted);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        readOnly
        value={display}
        disabled={disabled}
        placeholder="MM/DD/YYYY"
        onClick={() => !disabled && setOpen(o => !o)}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer bg-white"
      />

      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, zIndex: 9999,
          background: 'white', border: '1px solid #e5e7eb',
          borderRadius: '10px', padding: '16px', width: '280px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}>

          {/* Month + Year header */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', alignItems: 'center' }}>
            <button type="button"
              onClick={() => setCur(d => new Date(d.getFullYear(), d.getMonth()-1, 1))}
              style={{ border: '1px solid #e5e7eb', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', background: 'white', fontSize: '16px' }}>
              ‹
            </button>

            <select value={cur.getMonth()}
              onChange={e => setCur(d => new Date(d.getFullYear(), +e.target.value, 1))}
              style={{ flex: 1, padding: '4px 6px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px' }}>
              {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>

            {/* ← This is the year dropdown that fixes your problem */}
            <select value={cur.getFullYear()}
              onChange={e => setCur(d => new Date(+e.target.value, d.getMonth(), 1))}
              style={{ width: '80px', padding: '4px 6px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px' }}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            <button type="button"
              onClick={() => setCur(d => new Date(d.getFullYear(), d.getMonth()+1, 1))}
              style={{ border: '1px solid #e5e7eb', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', background: 'white', fontSize: '16px' }}>
              ›
            </button>
          </div>

          {/* Day column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
            {days.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>{d}</div>
            ))}
          </div>

          {/* Calendar days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => {
              const date = new Date(cur.getFullYear(), cur.getMonth(), d);
              const isDisabled = date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
              const isSelected = parsed && date.toDateString() === parsed.toDateString();
              const isToday = date.toDateString() === today.toDateString();
              return (
                <button key={d} type="button"
                  disabled={isDisabled}
                  onClick={() => selectDay(d)}
                  style={{
                    textAlign: 'center', fontSize: '13px', padding: '6px 2px',
                    borderRadius: '6px', border: 'none',
                    cursor: isDisabled ? 'default' : 'pointer',
                    background: isSelected ? '#059669' : 'transparent',
                    color: isDisabled ? '#d1d5db' : isSelected ? 'white' : isToday ? '#059669' : '#111827',
                    fontWeight: isToday ? 600 : 400
                  }}>
                  {d}
                </button>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
};

export default DatePicker;