import { useEffect, useRef } from 'react';
import { createChart, type IChartApi, type UTCTimestamp, ColorType, CandlestickSeries } from 'lightweight-charts';

interface ChartProps {
  symbol: string;
}

function generateMockCandles(symbol: string) {
  const candles = [];
  const basePrice = symbol.startsWith('BTC') ? 50000 : 3000;
  let price = basePrice;
  const now = Math.floor(Date.now() / 1000);

  for (let i = 200; i >= 0; i--) {
    const time = now - i * 3600;
    const open = price;
    const change = (Math.random() - 0.48) * basePrice * 0.01;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * basePrice * 0.005;
    const low = Math.min(open, close) - Math.random() * basePrice * 0.005;
    candles.push({ time: time as UTCTimestamp, open, high, low, close });
    price = close;
  }
  return candles;
}

export default function Chart({ symbol }: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0b0e11' },
        textColor: '#848e9c',
      },
      grid: {
        vertLines: { color: '#1e2329' },
        horzLines: { color: '#1e2329' },
      },
      crosshair: {
        vertLine: { color: '#2b3139' },
        horzLine: { color: '#2b3139' },
      },
      width: containerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: '#2b3139',
      },
      rightPriceScale: {
        borderColor: '#2b3139',
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#0ecb81',
      downColor: '#f6465d',
      borderUpColor: '#0ecb81',
      borderDownColor: '#f6465d',
      wickUpColor: '#0ecb81',
      wickDownColor: '#f6465d',
    });

    series.setData(generateMockCandles(symbol));
    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [symbol]);

  return <div ref={containerRef} style={{ width: '100%' }} />;
}
