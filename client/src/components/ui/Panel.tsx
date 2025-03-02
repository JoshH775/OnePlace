type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Panel({ children, className = "" }: Props) {
  return (
    <div
      className={`flex flex-col gap-3 border border-gray-300 dark:border-onyx-light h-fit w-1/2 rounded-md p-12 ${className}`}
    >
      {children}
    </div>
  );
}
