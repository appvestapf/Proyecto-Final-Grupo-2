interface BadgeProps {
  text: string;
  type: 'Temporario' | 'Residencial';
}

export const Badge = ({ text, type }: BadgeProps) => {
  const bgClass = type === 'Temporario' ? 'bg-primary' : 'bg-secondary';
  
  return (
    <span className={`${bgClass} text-white px-2 py-1 rounded-[12px] text-xs font-semibold`}>
      {text}
    </span>
  );
};