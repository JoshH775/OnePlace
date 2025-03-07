type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Panel({ children, className = "" }: Props) {
  return (
    <div
      className={`flex flex-col gap-3 border border-gray-300 dark:border-onyx-light h-fit rounded-md ${className}`}
    >
      {children}
    </div>
  );
}
