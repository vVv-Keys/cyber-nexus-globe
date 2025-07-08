import React, { useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useThreatStore } from '../store/threatStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as d3 from 'd3';

interface NetworkNode {
  id: string;
  group: string;
  country: string;
  threatLevel: number;
  connectionCount: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

interface NetworkLink {
  source: string;
  target: string;
  value: number;
  threatType: string;
}

export const NetworkTopologyVisualizer: React.FC = () => {
  const { threats, selectedThreat, selectThreat } = useThreatStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = React.useState<NetworkNode | null>(null);

  // Process threat data into network topology
  const { nodes, links } = useMemo(() => {
    const nodeMap = new Map<string, NetworkNode>();
    const linkMap = new Map<string, NetworkLink>();

    // Create nodes from unique locations
    threats.forEach(threat => {
      const sourceKey = `${threat.source.country}-${threat.source.city}`;
      const targetKey = `${threat.destination.country}-${threat.destination.city}`;

      // Add source node
      if (!nodeMap.has(sourceKey)) {
        nodeMap.set(sourceKey, {
          id: sourceKey,
          group: 'source',
          country: threat.source.country,
          threatLevel: 0,
          connectionCount: 0
        });
      }

      // Add target node
      if (!nodeMap.has(targetKey)) {
        nodeMap.set(targetKey, {
          id: targetKey,
          group: 'target',
          country: threat.destination.country,
          threatLevel: 0,
          connectionCount: 0
        });
      }

      // Update threat levels
      const severityWeight = { low: 1, medium: 2, high: 3, critical: 4 }[threat.severity];
      nodeMap.get(sourceKey)!.threatLevel += severityWeight;
      nodeMap.get(targetKey)!.threatLevel += severityWeight;
      nodeMap.get(sourceKey)!.connectionCount++;
      nodeMap.get(targetKey)!.connectionCount++;

      // Create link
      const linkKey = `${sourceKey}-${targetKey}`;
      if (!linkMap.has(linkKey)) {
        linkMap.set(linkKey, {
          source: sourceKey,
          target: targetKey,
          value: 0,
          threatType: threat.threatType
        });
      }
      linkMap.get(linkKey)!.value += severityWeight;
    });

    return {
      nodes: Array.from(nodeMap.values()),
      links: Array.from(linkMap.values())
    };
  }, [threats]);

  // D3.js force simulation
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;

    // Clear previous content
    svg.selectAll('*').remove();

    // Create simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(20));

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', (d: NetworkLink) => {
        const colors = {
          malware: '#ff0040',
          ddos: '#ff8800', 
          phishing: '#ffff00',
          ransomware: '#ff0080',
          intrusion: '#8800ff',
          dataexfil: '#00ff80'
        };
        return colors[d.threatType as keyof typeof colors] || '#00ffff';
      })
      .attr('stroke-width', (d: NetworkLink) => Math.min(d.value / 2, 10))
      .attr('stroke-opacity', 0.6);

    // Create nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', (d: NetworkNode) => Math.min(5 + d.connectionCount, 20))
      .attr('fill', (d: NetworkNode) => {
        if (d.threatLevel > 15) return '#ff0040';
        if (d.threatLevel > 10) return '#ff8800';
        if (d.threatLevel > 5) return '#ffff00';
        return '#00ff00';
      })
      .attr('stroke', '#000')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d: NetworkNode) => {
        setHoveredNode(d);
        d3.select(event.target).attr('stroke', '#fff').attr('stroke-width', 3);
      })
      .on('mouseout', (event) => {
        setHoveredNode(null);
        d3.select(event.target).attr('stroke', '#000').attr('stroke-width', 2);
      })
      .call(d3.drag<SVGCircleElement, NetworkNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Add labels
    const labels = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text((d: NetworkNode) => d.country)
      .attr('font-size', 10)
      .attr('font-family', 'monospace')
      .attr('fill', '#ffffff')
      .attr('text-anchor', 'middle')
      .attr('dy', -25);

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: NetworkNode) => d.x!)
        .attr('cy', (d: NetworkNode) => d.y!);

      labels
        .attr('x', (d: NetworkNode) => d.x!)
        .attr('y', (d: NetworkNode) => d.y!);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links]);

  return (
    <motion.div 
      className="bg-card border border-border rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-mono text-primary uppercase tracking-wide">
          Network Topology Analysis
        </h2>
        <div className="text-sm text-muted-foreground">
          {nodes.length} nodes, {links.length} connections
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Network visualization */}
        <div className="lg:col-span-3">
          <div className="relative bg-muted/10 rounded-lg overflow-hidden">
            <svg
              ref={svgRef}
              width="100%"
              height="600"
              viewBox="0 0 800 600"
              className="w-full h-auto"
            />
            
            {/* Hovered node tooltip */}
            {hoveredNode && (
              <div className="absolute top-4 left-4 bg-card/90 border border-border rounded p-3 text-xs">
                <div className="font-mono text-primary">{hoveredNode.id}</div>
                <div className="text-muted-foreground">Country: {hoveredNode.country}</div>
                <div className="text-muted-foreground">Threat Level: {hoveredNode.threatLevel}</div>
                <div className="text-muted-foreground">Connections: {hoveredNode.connectionCount}</div>
              </div>
            )}
          </div>
        </div>

        {/* Network statistics */}
        <div className="space-y-4">
          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase">
                Network Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-lg font-mono text-primary">
                  {nodes.length}
                </div>
                <div className="text-xs text-muted-foreground">Total Nodes</div>
              </div>
              <div>
                <div className="text-lg font-mono text-warning">
                  {links.length}
                </div>
                <div className="text-xs text-muted-foreground">Connections</div>
              </div>
              <div>
                <div className="text-lg font-mono text-destructive">
                  {nodes.filter(n => n.threatLevel > 10).length}
                </div>
                <div className="text-xs text-muted-foreground">High-Risk Nodes</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase">
                Top Targets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {nodes
                  .filter(n => n.group === 'target')
                  .sort((a, b) => b.threatLevel - a.threatLevel)
                  .slice(0, 5)
                  .map((node, index) => (
                    <div key={node.id} className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-mono">
                        {node.country}
                      </span>
                      <span className="text-destructive">
                        {node.threatLevel}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase">
                Threat Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(
                  links.reduce((acc, link) => {
                    acc[link.threatType] = (acc[link.threatType] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-xs">
                    <span className="text-foreground capitalize">{type}</span>
                    <span className="text-primary font-mono">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full" />
            <span className="text-muted-foreground">Low Threat (1-5)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-warning rounded-full" />
            <span className="text-muted-foreground">Medium Threat (6-10)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span className="text-muted-foreground">High Threat (11-15)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-destructive rounded-full" />
            <span className="text-muted-foreground">Critical Threat (16+)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};