type Props = {
  message?: string;
  className?: string;
}
const Spinner = ({ message, className = '' }: Props) => {
  return (
<div className={`flex flex-col justify-center items-center w-full h-full ${className}`}>
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
      {message && <p className="mt-4 text-indigo-600">{message}</p>}
    </div>
  );
};

export default Spinner;