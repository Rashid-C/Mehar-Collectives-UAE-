export default function LoadingPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0c0c0c',
      }}
    >
      <style>{`
        @keyframes mc-enter {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes mc-line {
          0%        { transform: scaleX(0); transform-origin: left;  opacity: 1; }
          49%       { transform: scaleX(1); transform-origin: left;  opacity: 1; }
          50%       { transform: scaleX(1); transform-origin: right; opacity: 1; }
          100%      { transform: scaleX(0); transform-origin: right; opacity: 1; }
        }
        @keyframes mc-logo {
          0%, 100% { opacity: 0.75; }
          50%       { opacity: 1;    }
        }

        .mc-wrap  { animation: mc-enter 0.9s cubic-bezier(0.22,1,0.36,1) both; }
        .mc-logo  { animation: mc-logo  2.4s ease-in-out infinite 0.9s; }
        .mc-line  { animation: mc-line  2s   ease-in-out infinite 1s;   }
      `}</style>

      <div
        className='mc-wrap'
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}
      >
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src='/icons/logo.svg'
          alt=''
          width={56}
          height={56}
          className='mc-logo'
          style={{ objectFit: 'contain', marginBottom: 24, filter: 'brightness(0) invert(1)' }}
        />

        {/* Brand name */}
        <p
          style={{
            color: '#e8e8e8',
            fontSize: 11,
            fontWeight: 300,
            letterSpacing: '0.55em',
            textTransform: 'uppercase',
            margin: 0,
            marginBottom: 18,
          }}
        >
          Mehar Collective
        </p>

        {/* Single sweeping line */}
        <div
          style={{
            width: 100,
            height: 1,
            background: '#222',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            className='mc-line'
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, #c8a96e 40%, #fff3d0 60%, #c8a96e 80%, transparent 100%)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
