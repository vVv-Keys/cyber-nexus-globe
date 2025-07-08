import React, { useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useThreatStore } from '../store/threatStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as d3 from 'd3';

interface TimelineEvent {
  timestamp: Date;
  threats: any[];
  severity: number;
  types: string[];
}

export const ThreatTimelineVisualizer: React.FC = () => {
  const { threats, timeRange, setTimeRange } = useThreatStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedTimeRange, setSelectedTimeRange] = React.useState<[Date, Date] | null>(null);

  // Process threats into timeline data
  const timelineData = useMemo(() => {
    const timeMap = new Map<string, TimelineEvent>();
    const timeInterval = 15 * 60 * 1000; // 15 minutes

    threats.forEach(threat => {
      const roundedTime = new Date(Math.floor(threat.timestamp.getTime() / timeInterval) * timeInterval);
      const key = roundedTime.toISOString();

      if (!timeMap.has(key)) {
        timeMap.set(key, {
          timestamp: roundedTime,
          threats: [],
          severity: 0,
          types: []
        });
      }

      const event = timeMap.get(key)!;
      event.threats.push(threat);
      
      const severityWeight = { low: 1, medium: 2, high: 3, critical: 4 }[threat.severity];
      event.severity += severityWeight;
      
      if (!event.types.includes(threat.threatType)) {
        event.types.push(threat.threatType);
      }
    });

    return Array.from(timeMap.values()).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [threats]);

  // D3 timeline visualization
  useEffect(() => {
    if (!svgRef.current || timelineData.length === 0) return;

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(timelineData, d => d.timestamp) as [Date, Date])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(timelineData, d => d.severity) || 0])
      .range([height, 0]);

    const colorScale = d3.scaleSequential(d3.interpolateSpectral)
      .domain([0, d3.max(timelineData, d => d.severity) || 0]);

    // Create gradient for area chart
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'timeline-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', height)
      .attr('x2', 0).attr('y2', 0);

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#ff0040')
      .attr('stop-opacity', 0.1);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#ff0040')
      .attr('stop-opacity', 0.8);

    // Area generator
    const area = d3.area<TimelineEvent>()
      .x(d => xScale(d.timestamp))
      .y0(height)
      .y1(d => yScale(d.severity))
      .curve(d3.curveCardinal);

    // Line generator
    const line = d3.line<TimelineEvent>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.severity))
      .curve(d3.curveCardinal);

    // Add area
    g.append('path')
      .datum(timelineData)
      .attr('fill', 'url(#timeline-gradient)')
      .attr('d', area);

    // Add line
    g.append('path')
      .datum(timelineData)
      .attr('fill', 'none')
      .attr('stroke', '#ff0040')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots
    g.selectAll('.dot')
      .data(timelineData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.timestamp))
      .attr('cy', d => yScale(d.severity))
      .attr('r', d => Math.min(3 + d.threats.length / 2, 8))
      .attr('fill', d => {
        if (d.severity > 15) return '#ff0040';
        if (d.severity > 10) return '#ff8800';
        if (d.severity > 5) return '#ffff00';
        return '#00ff00';
      })
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        // Tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('padding', '10px')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('border', '1px solid #00ffff')
          .style('border-radius', '5px')
          .style('color', '#fff')
          .style('font-family', 'monospace')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('opacity', 0);

        tooltip.html(`
          <div>Time: ${d.timestamp.toLocaleString()}</div>
          <div>Threats: ${d.threats.length}</div>
          <div>Severity: ${d.severity}</div>
          <div>Types: ${d.types.join(', ')}</div>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
          .transition()
          .duration(200)
          .style('opacity', 1);

        d3.select(this).attr('stroke', '#fff').attr('stroke-width', 2);
      })
      .on('mouseout', function() {
        d3.selectAll('.tooltip').remove();
        d3.select(this).attr('stroke', '#000').attr('stroke-width', 1);
      });

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat('%H:%M') as any))
      .selectAll('text')
      .attr('fill', '#fff')
      .style('font-family', 'monospace');

    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('fill', '#fff')
      .style('font-family', 'monospace');

    // Brush for time range selection
    const brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on('end', (event) => {
        if (!event.selection) {
          setSelectedTimeRange(null);
          return;
        }
        
        const [x0, x1] = event.selection;
        const range: [Date, Date] = [xScale.invert(x0), xScale.invert(x1)];
        setSelectedTimeRange(range);
      });

    g.append('g')
      .attr('class', 'brush')
      .call(brush);

  }, [timelineData]);

  // Apply selected time range
  const applyTimeRange = () => {
    if (selectedTimeRange) {
      setTimeRange({ start: selectedTimeRange[0], end: selectedTimeRange[1] });
    }
  };

  // Reset time range
  const resetTimeRange = () => {
    setSelectedTimeRange(null);
    setTimeRange({
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date()
    });
  };

  return (
    <motion.div 
      className="bg-card border border-border rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-mono text-primary uppercase tracking-wide">
          Threat Timeline Analysis
        </h2>
        <div className="flex space-x-2">
          {selectedTimeRange && (
            <Button
              onClick={applyTimeRange}
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:bg-primary/10"
            >
              Apply Filter
            </Button>
          )}
          <Button
            onClick={resetTimeRange}
            variant="outline" 
            size="sm"
            className="border-muted-foreground text-muted-foreground hover:bg-muted/10"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="bg-muted/10 rounded-lg p-4 mb-6">
        <svg
          ref={svgRef}
          width="100%"
          height="300"
          viewBox="0 0 800 300"
          className="w-full"
        />
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Drag to select time range • Hover dots for details
        </div>
      </div>

      {/* Timeline statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono text-muted-foreground uppercase">
              Time Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-primary">
              {timelineData.length}
            </div>
            <div className="text-xs text-muted-foreground">15-min intervals</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono text-muted-foreground uppercase">
              Peak Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-destructive">
              {Math.max(...timelineData.map(d => d.severity), 0)}
            </div>
            <div className="text-xs text-muted-foreground">Max threat level</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono text-muted-foreground uppercase">
              Avg Per Interval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-warning">
              {timelineData.length > 0 ? 
                (timelineData.reduce((sum, d) => sum + d.threats.length, 0) / timelineData.length).toFixed(1) : 
                '0'
              }
            </div>
            <div className="text-xs text-muted-foreground">Threats/interval</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono text-muted-foreground uppercase">
              Time Span
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-info">
              {timelineData.length > 0 ? 
                Math.round((timelineData[timelineData.length - 1].timestamp.getTime() - timelineData[0].timestamp.getTime()) / (1000 * 60 * 60)) : 
                '0'
              }h
            </div>
            <div className="text-xs text-muted-foreground">Total duration</div>
          </CardContent>
        </Card>
      </div>

      {/* Selected time range info */}
      {selectedTimeRange && (
        <motion.div 
          className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className="text-sm font-mono text-primary">
            Selected Range: {selectedTimeRange[0].toLocaleString()} - {selectedTimeRange[1].toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Click "Apply Filter" to filter all visualizations to this time range
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};