import SEO from 'components/SEO';
import { SwapComponent } from 'components/Swap/SwapComponent';
import { useRouter } from 'next/router';
import { Field } from 'state/swap/actions';

export default function SwapPage() {
  const router = useRouter();

  const { tokens } = router.query;

  const [paramTokenA, paramTokenB] = (tokens ?? ['null', 'null']) as string[];

  const prefilledState = {
    [Field.INPUT]: { currencyId: paramTokenA },
    [Field.OUTPUT]: { currencyId: paramTokenB },
  };

  return (
    <>
      <SEO title="Swap - Soroswap" description="Soroswap Swap" />
      <SwapComponent prefilledState={prefilledState}/>
    </>
  );
}
