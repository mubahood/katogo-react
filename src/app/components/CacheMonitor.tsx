// src/app/components/CacheMonitor.tsx
/**
 * CacheMonitor - Development component for monitoring cache performance
 * 
 * Shows cache statistics, hit rates, and storage usage
 * Only renders in development mode or when explicitly enabled
 */

import React, { useState, useEffect } from 'react';
import CacheService from '../services/CacheService';
import CacheUtils from '../services/CacheUtils';
import { CACHE_CONFIG } from '../../Constants';

interface CacheMonitorProps {
  enabled?: boolean;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  minimized?: boolean;
}

const CacheMonitor: React.FC<CacheMonitorProps> = ({
  enabled = CACHE_CONFIG.DEBUG_MODE,
  position = 'bottom-right',
  minimized = true
}) => {
  const [stats, setStats] = useState(CacheService.getStats());
  const [health, setHealth] = useState(CacheUtils.getCacheHealth());
  const [isMinimized, setIsMinimized] = useState(minimized);
  const [isVisible, setIsVisible] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setStats(CacheService.getStats());
      setHealth(CacheUtils.getCacheHealth());
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [enabled]);

  if (!isVisible) return null;

  const positionStyles = {
    'bottom-left': { bottom: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#28a745';
      case 'warning': return '#ffc107';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    ...positionStyles[position],
    zIndex: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    color: 'white',
    borderRadius: '8px',
    padding: isMinimized ? '8px 12px' : '12px 16px',
    fontSize: '12px',
    fontFamily: 'monospace',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    minWidth: isMinimized ? 'auto' : '280px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isMinimized ? 0 : '8px',
    fontSize: '11px',
    fontWeight: 'bold',
  };

  const statStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '4px 0',
    fontSize: '11px',
  };

  const handleToggle = () => {
    setIsMinimized(!isMinimized);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const clearCache = () => {
    CacheService.clearAll();
    setStats(CacheService.getStats());
    setHealth(CacheUtils.getCacheHealth());
  };

  return (
    <div style={containerStyle} onClick={handleToggle}>
      <div style={headerStyle}>
        <span style={{ color: getHealthColor(health.status) }}>
          🗄️ Cache {isMinimized ? `${stats.hitRate.toFixed(1)}%` : 'Monitor'}
        </span>
        {!isMinimized && (
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearCache();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffc107',
                cursor: 'pointer',
                marginRight: '8px',
                fontSize: '10px',
              }}
              title="Clear Cache"
            >
              🗑️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc3545',
                cursor: 'pointer',
                fontSize: '10px',
              }}
              title="Close Monitor"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {!isMinimized && (
        <div>
          <div style={statStyle}>
            <span>Hit Rate:</span>
            <span style={{ color: getHealthColor(health.status) }}>
              {stats.hitRate.toFixed(1)}%
            </span>
          </div>
          
          <div style={statStyle}>
            <span>Hits/Misses:</span>
            <span>{stats.hits}/{stats.misses}</span>
          </div>
          
          <div style={statStyle}>
            <span>Items:</span>
            <span>{stats.itemCount}</span>
          </div>
          
          <div style={statStyle}>
            <span>Size:</span>
            <span>{formatBytes(stats.totalSize)}</span>
          </div>
          
          <div style={statStyle}>
            <span>Status:</span>
            <span style={{ color: getHealthColor(health.status) }}>
              {health.status.toUpperCase()}
            </span>
          </div>

          {health.issues.length > 0 && (
            <div style={{ 
              marginTop: '8px', 
              padding: '4px 8px', 
              backgroundColor: 'rgba(255, 193, 7, 0.2)',
              borderRadius: '4px',
              fontSize: '10px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Issues:</div>
              {health.issues.map((issue, index) => (
                <div key={index}>• {issue}</div>
              ))}
            </div>
          )}

          <div style={{
            marginTop: '8px',
            padding: '4px 0',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '10px',
            opacity: 0.7
          }}>
            Click to minimize • 🗑️ to clear • ✕ to close
          </div>
        </div>
      )}
    </div>
  );
};

export default CacheMonitor;