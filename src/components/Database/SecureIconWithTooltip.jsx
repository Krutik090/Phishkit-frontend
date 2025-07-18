import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

function SecureIconWithTooltip() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <ShieldCheck
        style={{ width: '32px', height: '32px', cursor: 'pointer', color: '#10b981' }}
      />

      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '120%', // Positions tooltip above the icon
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#111827',
            color: '#f9fafb',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '14px',
            lineHeight: '1.4',
            textAlign: 'center',
            whiteSpace: 'normal',
            zIndex: 9999,
            width: '240px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          Your connection is fully secured.<br />
          All data is encrypted end-to-end.
        </div>
      )}
    </div>
  );
}

export default SecureIconWithTooltip;
