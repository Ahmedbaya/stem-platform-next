import { useRouter } from 'next/router';

const MyComponent = () => {
  const router = useRouter();
  const { competitionId } = router.query; // Ensure consistent naming

  return (
    <div>
      <h1>Competition ID: {competitionId}</h1>
    </div>
  );
};

export default MyComponent;