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
    <div className='flex space-x-5 text-sm'>
      <div className={`flex-none p-3 text-center font-semibold ${color} rounded`}>
        {status}
      </div>
      <p className='flex-1 flex justify-between items-center text-white/80'>{message}</p>
    </div>
    
  );
}