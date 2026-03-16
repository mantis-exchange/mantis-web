import { useEffect, useRef } from 'react';
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
  ColorType,
  CandlestickSeries,
  type CandlestickData,
} from 'lightweight-charts';
import type { CandleData } from '../types';

const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d'];

interface ChartProps {
  symbol: string;
  candles: CandleData[];
  interval: string;
  onIntervalChange: (interval: string) => void;
}

export default function Chart({ symbol, candles, interval, onIntervalChange }: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  // Create chart once per symbol
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
      timeScale: { borderColor: '#2b3139' },
      rightPriceScale: { borderColor: '#2b3139' },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#0ecb81',
      downColor: '#f6465d',
      borderUpColor: '#0ecb81',
      borderDownColor: '#f6465d',
      wickUpColor: '#0ecb81',
      wickDownColor: '#f6465d',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [symbol]);

  // Update data when candles change
  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;

    const data: CandlestickData<UTCTimestamp>[] = candles.map((c) => ({
      time: c.time as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    seriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '8px 8px 4px',
        background: '#0b0e11',
      }}>
        {INTERVALS.map((iv) => (
          <button
            key={iv}
            onClick={() => onIntervalChange(iv)}
            style={{
              background: iv === interval ? '#2b3139' : 'transparent',
              border: 'none',
              color: iv === interval ? '#f0b90b' : '#848e9c',
              padding: '4px 10px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: iv === interval ? 600 : 400,
            }}
          >
            {iv}
          </button>
        ))}
      </div>
      <div ref={containerRef} style={{ width: '100%' }} />
    </div>
  );
}
