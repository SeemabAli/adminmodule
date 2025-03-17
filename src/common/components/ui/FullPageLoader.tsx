export const FullPageLoader = () => {
  return (
    <div className="absolute flex h-screen w-full items-center justify-center bg-white top-0 z-50">
      <span className="loading loading-spinner text-info w-14 h-14"></span>
    </div>
  );
};
