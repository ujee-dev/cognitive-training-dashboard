interface ProgressProps {
  status: string;
  message: string;
  color: string;
}

export function ProgressBadge({
  status,
  message,
  color,
}: ProgressProps) {
  return (
    <div className='flex items-center space-x-5 text-sm'>
      <div className={`flex-none p-3 text-center text-black font-semibold ${color} rounded`}>
        {status}
      </div>
      <span>{message}</span>
    </div>
    
  );
}