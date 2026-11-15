import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useApp } from '../../context/AppContext';
import { TrendingUp } from 'lucide-react';

export const BilledVsCollectedChart: React.FC = () => {
  const { receipts, leases, units } = useApp();

  const { months, billedData, collectedData, hasAnyData } = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    const monthList: { label: string; year: number; month: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yr = d.getFullYear() % 100;
      const mIdx = d.getMonth();
      monthList.push({
        label: `${monthNames[mIdx]} '${yr}`,
        year: d.getFullYear(),
        month: mIdx,
      });
    }

    // Live collected rent per month (in ₹ Lakhs)
    const collected = monthList.map((m) => {
      const monthPaise = receipts
        .filter((r) => {
          const dateStr = r.paymentDate || (r as any).createdAt;
          if (!dateStr) return false;
          const d = new Date(dateStr);
          return d.getFullYear() === m.year && d.getMonth() === m.month && r.status !== 'REVERSED';
        })
        .reduce((sum, r) => sum + (r.amountPaise || 0), 0);

      return Number((monthPaise / (100 * 100000)).toFixed(2));
    });

    // Live billed rent per month (in ₹ Lakhs)
    const billed = monthList.map((m) => {
      const monthStart = new Date(m.year, m.month, 1);
      const monthEnd = new Date(m.year, m.month + 1, 0, 23, 59, 59);

      let monthPaise = leases
        .filter((l) => {
          const s = new Date(l.startDate);
          const e = new Date(l.endDate);
          return s <= monthEnd && e >= monthStart && l.status === 'ACTIVE';
        })
        .reduce((sum, l) => sum + (l.rentPaise || 0) + (l.maintenancePaise || 0), 0);

      // If current month and leases aren't generated yet, compute from occupied units
      if (monthPaise === 0 && m.month === now.getMonth() && m.year === now.getFullYear()) {
        monthPaise = units
          .filter((u) => u.status === 'OCCUPIED')
          .reduce((sum, u) => sum + (u.baseRentPaise || 0) + (u.maintenancePaise || 0), 0);
      }

      return Number((monthPaise / (100 * 100000)).toFixed(2));
    });

    const hasData = billed.some((v) => v > 0) || collected.some((v) => v > 0);

    return {
      months: monthList.map((m) => m.label),
      billedData: billed,
      collectedData: collected,
      hasAnyData: hasData,
    };
  }, [receipts, leases, units]);

  if (!hasAnyData) {
    return (
      <div className="w-full h-[280px] flex flex-col items-center justify-center p-6 bg-ground/40 rounded-[12px] border border-dashed border-line text-center">
        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-muted-text mb-2.5 border border-line shadow-xs">
          <TrendingUp size={18} />
        </div>
        <p className="text-sm font-semibold text-ink">No 12-Month Collection History Recorded</p>
        <p className="text-xs text-muted-text mt-1 max-w-sm">
          Live billed and collected rent will automatically populate this chart as leases and payment receipts are recorded.
        </p>
      </div>
    );
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#FBF7EF',
      borderColor: '#DDCFB8',
      textStyle: {
        color: '#2A1F17',
        fontFamily: 'Figtree',
      },
      formatter: (params: any) => {
        let content = `<div style="font-family: 'Young Serif', serif; font-size: 14px; margin-bottom: 4px;">${params[0].axisValue}</div>`;
        params.forEach((item: any) => {
          content += `
            <div style="display: flex; justify-content: space-between; gap: 16px; font-size: 12px; margin-top: 2px;">
              <span>${item.marker} ${item.seriesName}</span>
              <span style="font-weight: bold; font-family: 'Figtree';">₹${item.value} Lakhs</span>
            </div>
          `;
        });
        return content;
      },
    },
    legend: {
      top: 0,
      right: 10,
      textStyle: {
        color: '#5E4E41',
        fontFamily: 'Figtree',
        fontSize: 12,
      },
      itemGap: 16,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '5%',
      top: '40px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: {
        lineStyle: {
          color: '#DDCFB8',
        },
      },
      axisLabel: {
        color: '#75634F',
        fontFamily: 'Figtree',
        fontSize: 11,
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Amount (₹ Lakhs)',
      nameTextStyle: {
        color: '#75634F',
        fontSize: 11,
        fontFamily: 'Figtree',
      },
      splitLine: {
        lineStyle: {
          color: '#E2D5BF',
          type: 'dashed',
        },
      },
      axisLabel: {
        color: '#75634F',
        fontFamily: 'Figtree',
        formatter: (v: number) => `₹${v}L`,
      },
    },
    series: [
      {
        name: 'Billed Rent',
        type: 'bar',
        data: billedData,
        itemStyle: {
          color: '#DDCFB8',
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '28%',
      },
      {
        name: 'Collected Rent',
        type: 'bar',
        data: collectedData,
        itemStyle: {
          color: '#5F7A3E',
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '28%',
      },
    ],
  };

  return (
    <div className="w-full h-[280px]">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} lazyUpdate={true} />
    </div>
  );
};
