interface Props {
  message: string;
  ok?: boolean;
}

export function Toast({ message, ok = true }: Props) {
  return (
    <div className="toast on">
      <span className="ts" style={{ color: ok ? 'var(--emerald)' : '#ff9a9a' }}>
        {ok ? '✓' : '!'}
      </span>
      <span>{message}</span>
    </div>
  );
}
