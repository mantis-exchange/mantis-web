import { useEffect, useRef, useState, useMemo } from 'react';
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  type CandlestickData,
  CrosshairMode,
} from 'lightweight-charts';
import type { CandleData } from '../types';

const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d'];

interface ChartProps {
  symbol: string;
  candles: CandleData[];
  interval: string;
  onIntervalChange: (interval: string) => void;
}

// Simple Moving Average
function calcSMA(data: CandleData[], period: number): { time: number; value: number }[] {
  const result: { time: number; value: number }[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += data[i - j].close;
    result.push({ time: data[i].time, value: sum / period });
  }
  return result;
}

// Exponential Moving Average
function calcEMA(data: CandleData[], period: number): { time: number; value: number }[] {
  if (data.length === 0) return [];
  const k = 2 / (period + 1);
  const result: { time: number; value: number }[] = [];
  let ema = data[0].close;
  for (let i = 0; i < data.length; i++) {
    ema = data[i].close * k + ema * (1 - k);
    if (i >= period - 1) result.push({ time: data[i].time, value: ema });
  }
  return result;
}

export default function Chart({ symbol, candles, interval, onIntervalChange }: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const ma7Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const ma25Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const [showMA, setShowMA] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [hoverData, setHoverData] = useState<{ o: string; h: string; l: string; c: string; change: string; positive: boolean } | null>(null);

  // Compute last candle stats for header
  const lastStats = useMemo(() => {
    if (candles.length === 0) return null;
    const last = candles[candles.length - 1];
    const prev = candles.length > 1 ? candles[candles.length - 2] : last;
    const change = ((last.close - prev.close) / prev.close * 100);
    const high24 = Math.max(...candles.slice(-24).map(c => c.high));
    const low24 = Math.min(...candles.slice(-24).map(c => c.low));
    return {
      price: last.close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }),
      change: change.toFixed(2),
      positive: change >= 0,
      high24: high24.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }),
      low24: low24.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }),
    };
  }, [candles]);

  // Create chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0b0e11' },
        textColor: '#848e9c',
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(43,49,57,0.5)' },
        horzLines: { color: 'rgba(43,49,57,0.5)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(240,185,11,0.3)', labelBackgroundColor: '#2b3139' },
        horzLine: { color: 'rgba(240,185,11,0.3)', labelBackgroundColor: '#2b3139' },
      },
      width: containerRef.current.clientWidth,
      height: 500,
      timeScale: {
        borderColor: '#2b3139',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#2b3139',
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
    });

    // Candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#0ecb81',
      downColor: '#f6465d',
      borderUpColor: '#0ecb81',
      borderDownColor: '#f6465d',
      wickUpColor: '#0ecb81',
      wickDownColor: '#f6465d',
    });

    // Volume histogram (at bottom)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    // MA lines
    const ma7Series = chart.addSeries(LineSeries, {
      color: '#f0b90b',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const ma25Series = chart.addSeries(LineSeries, {
      color: '#8b5cf6',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    ma7Ref.current = ma7Series;
    ma25Ref.current = ma25Series;

    // Crosshair move handler for OHLC tooltip
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        setHoverData(null);
        return;
      }
      const data = param.seriesData.get(candleSeries) as CandlestickData<UTCTimestamp> | undefined;
      if (data) {
        const change = ((data.close - data.open) / data.open * 100);
        setHoverData({
          o: data.open.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }),
          h: data.high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }),
          l: data.low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }),
          c: data.close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }),
          change: change.toFixed(2),
          positive: change >= 0,
        });
      }
    });

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
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      ma7Ref.current = null;
      ma25Ref.current = null;
    };
  }, [symbol]);

  // Update data
  useEffect(() => {
    if (!candleSeriesRef.current || candles.length === 0) return;

    const data: CandlestickData<UTCTimestamp>[] = candles.map((c) => ({
      time: c.time as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    candleSeriesRef.current.setData(data);

    // Volume
    if (volumeSeriesRef.current && showVolume) {
      volumeSeriesRef.current.setData(
        candles.map((c) => ({
          time: c.time as UTCTimestamp,
          value: Math.abs(c.close - c.open) * 1000 + Math.random() * 500, // Simulated volume
          color: c.close >= c.open ? 'rgba(14,203,129,0.3)' : 'rgba(246,70,93,0.3)',
        }))
      );
    }

    // MA lines
    if (ma7Ref.current && showMA) {
      const sma7 = calcSMA(candles, 7);
      ma7Ref.current.setData(sma7.map(p => ({ time: p.time as UTCTimestamp, value: p.value })));
    }
    if (ma25Ref.current && showMA) {
      const ema25 = calcEMA(candles, 25);
      ma25Ref.current.setData(ema25.map(p => ({ time: p.time as UTCTimestamp, value: p.value })));
    }

    chartRef.current?.timeScale().fitContent();
  }, [candles, showMA, showVolume]);

  // Toggle visibility
  useEffect(() => {
    if (ma7Ref.current) ma7Ref.current.applyOptions({ visible: showMA });
    if (ma25Ref.current) ma25Ref.current.applyOptions({ visible: showMA });
  }, [showMA]);

  useEffect(() => {
    if (volumeSeriesRef.current) volumeSeriesRef.current.applyOptions({ visible: showVolume });
  }, [showVolume]);

  const ohlc = hoverData;

  return (
    <div style={{ width: '100%', background: '#0b0e11' }}>
      {/* Ticker bar */}
      {lastStats && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 24,
          padding: '10px 12px', borderBottom: '1px solid #1e2329',
          fontSize: 12, color: '#848e9c',
        }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: lastStats.positive ? '#0ecb81' : '#f6465d', fontFamily: "'SF Mono','Fira Code',monospace" }}>
            {lastStats.price}
          </span>
          <span style={{ color: lastStats.positive ? '#0ecb81' : '#f6465d', fontWeight: 600 }}>
            {lastStats.positive ? '+' : ''}{lastStats.change}%
          </span>
          <div>
            <div style={{ fontSize: 11, color: '#848e9c' }}>24h High</div>
            <div style={{ color: '#eaecef', fontFamily: "'SF Mono','Fira Code',monospace" }}>{lastStats.high24}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#848e9c' }}>24h Low</div>
            <div style={{ color: '#eaecef', fontFamily: "'SF Mono','Fira Code',monospace" }}>{lastStats.low24}</div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '6px 8px',
        borderBottom: '1px solid #1e2329',
      }}>
        {/* Interval buttons */}
        {INTERVALS.map((iv) => (
          <button
            key={iv}
            onClick={() => onIntervalChange(iv)}
            style={{
              background: iv === interval ? '#2b3139' : 'transparent',
              border: 'none',
              color: iv === interval ? '#f0b90b' : '#848e9c',
              padding: '5px 10px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: iv === interval ? 600 : 400,
            }}
          >
            {iv}
          </button>
        ))}

        <div style={{ width: 1, height: 16, background: '#2b3139', margin: '0 8px' }} />

        {/* Indicator toggles */}
        <button
          onClick={() => setShowMA(!showMA)}
          style={{
            background: showMA ? 'rgba(240,185,11,0.15)' : 'transparent',
            border: showMA ? '1px solid rgba(240,185,11,0.3)' : '1px solid transparent',
            color: showMA ? '#f0b90b' : '#848e9c',
            padding: '4px 10px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          MA 7/25
        </button>
        <button
          onClick={() => setShowVolume(!showVolume)}
          style={{
            background: showVolume ? 'rgba(14,203,129,0.15)' : 'transparent',
            border: showVolume ? '1px solid rgba(14,203,129,0.3)' : '1px solid transparent',
            color: showVolume ? '#0ecb81' : '#848e9c',
            padding: '4px 10px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          Vol
        </button>
      </div>

      {/* OHLC overlay */}
      <div style={{ position: 'relative' }}>
        {ohlc && (
          <div style={{
            position: 'absolute', top: 8, left: 12, zIndex: 10,
            display: 'flex', gap: 12, fontSize: 11,
            pointerEvents: 'none',
          }}>
            <span style={{ color: '#848e9c' }}>O <span style={{ color: ohlc.positive ? '#0ecb81' : '#f6465d' }}>{ohlc.o}</span></span>
            <span style={{ color: '#848e9c' }}>H <span style={{ color: ohlc.positive ? '#0ecb81' : '#f6465d' }}>{ohlc.h}</span></span>
            <span style={{ color: '#848e9c' }}>L <span style={{ color: ohlc.positive ? '#0ecb81' : '#f6465d' }}>{ohlc.l}</span></span>
            <span style={{ color: '#848e9c' }}>C <span style={{ color: ohlc.positive ? '#0ecb81' : '#f6465d' }}>{ohlc.c}</span></span>
            <span style={{ color: ohlc.positive ? '#0ecb81' : '#f6465d', fontWeight: 600 }}>
              {ohlc.positive ? '+' : ''}{ohlc.change}%
            </span>
          </div>
        )}
        <div ref={containerRef} style={{ width: '100%' }} />
      </div>
    </div>
  );
}
