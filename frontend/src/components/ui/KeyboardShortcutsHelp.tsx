import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { X, Keyboard, Search, Command } from 'lucide-react';
import { KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
  title?: string;
  className?: string;
}

/**
 * Keyboard Shortcuts Help Modal
 * 
 * Features:
 * - Categorized shortcut display
 * - Search functionality
 * - Responsive design
 * - Smooth animations
 * - Accessibility support
 * - Platform-specific key display (⌘ for Mac, Ctrl for others)
 */
const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen,
  onClose,
  shortcuts,
  title = 'Keyboard Shortcuts',
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Detect platform for key display
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  // Format shortcut keys for display
  const formatShortcutKey = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    
    if (shortcut.ctrlKey) {
      parts.push(isMac ? '⌘' : 'Ctrl');
    }
    if (shortcut.metaKey) {
      parts.push('⌘');
    }
    if (shortcut.altKey) {
      parts.push(isMac ? '⌥' : 'Alt');
    }
    if (shortcut.shiftKey) {
      parts.push('⇧');
    }
    
    // Format special keys
    let key = shortcut.key;
    switch (key.toLowerCase()) {
      case 'escape':
        key = 'Esc';
        break;
      case 'enter':
        key = '↵';
        break;
      case 'arrowup':
        key = '↑';
        break;
      case 'arrowdown':
        key = '↓';
        break;
      case 'arrowleft':
        key = '←';
        break;
      case 'arrowright':
        key = '→';
        break;
      case ' ':
        key = 'Space';
        break;
      default:
        key = key.toUpperCase();
    }
    
    parts.push(key);
    
    return parts.join(' + ');
  };

  // Filter shortcuts based on search term
  const filteredShortcuts = shortcuts.filter((shortcut) =>
    shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shortcut.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatShortcutKey(shortcut).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group shortcuts by category
  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={clsx(
              'fixed inset-4 md:inset-8 lg:inset-16 z-50',
              'bg-white rounded-xl shadow-2xl',
              'flex flex-col max-h-full',
              className
            )}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Keyboard className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close shortcuts help"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search shortcuts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Shortcuts List */}
            <div className="flex-1 overflow-y-auto p-6">
              {Object.keys(groupedShortcuts).length === 0 ? (
                <div className="text-center py-8">
                  <Command className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No shortcuts found matching your search.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                        {category}
                      </h3>
                      
                      <div className="grid gap-2">
                        {categoryShortcuts.map((shortcut, index) => (
                          <motion.div
                            key={`${category}-${index}`}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                          >
                            <span className="text-gray-700 font-medium">
                              {shortcut.description}
                            </span>
                            
                            <div className="flex items-center space-x-1">
                              {formatShortcutKey(shortcut).split(' + ').map((key, keyIndex) => (
                                <React.Fragment key={keyIndex}>
                                  {keyIndex > 0 && (
                                    <span className="text-gray-400 text-sm">+</span>
                                  )}
                                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono text-gray-600 shadow-sm">
                                    {key}
                                  </kbd>
                                </React.Fragment>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span>Press <kbd className="px-1 py-0.5 bg-white border rounded text-xs">Esc</kbd> to close</span>
                  <span>Press <kbd className="px-1 py-0.5 bg-white border rounded text-xs">?</kbd> to open this help</span>
                </div>
                <span>{filteredShortcuts.length} shortcuts available</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcutsHelp;
