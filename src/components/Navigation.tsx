import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Network, 
  BarChart3, 
  Shield, 
  Activity, 
  Radar,
  AlertTriangle,
  Map,
  Home
} from 'lucide-react';

interface NavigationProps {
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ className = '' }) => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/globe', label: '3D Globe', icon: Globe },
    { path: '/network', label: 'Network', icon: Network },
    { path: '/timeline', label: 'Timeline', icon: BarChart3 },
    { path: '/heatmap', label: 'Heat Map', icon: Map },
    { path: '/mitre', label: 'MITRE', icon: Shield },
    { path: '/correlation', label: 'Correlation', icon: Radar },
    { path: '/surface', label: 'Attack Surface', icon: AlertTriangle },
    { path: '/alerts', label: 'Live Alerts', icon: Activity },
    { path: '/admin', label: 'Admin', icon: Shield },
  ];

  return (
    <nav className={`bg-card/50 border-b border-border ${className}`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center space-x-1 py-2 overflow-x-auto">
          {navItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-mono transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`
              }
            >
              {({ isActive }) => (
                <motion.div
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="w-1 h-1 bg-primary-foreground rounded-full"
                      layoutId="activeIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};