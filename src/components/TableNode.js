import React, { useState, useCallback } from 'react';
import { Handle } from 'reactflow';
import {
  Paper,
  Typography,
  List,
  ListItem,
  IconButton,
  TextField,
  Box,
  Menu,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import KeyIcon from '@mui/icons-material/Key';
import LinkIcon from '@mui/icons-material/Link';

const TableNode = ({ data, id }) => {
  const { useTheme } = require('@mui/material');
  const [columns, setColumns] = useState(data.columns || []);
  const [newColumn, setNewColumn] = useState({ name: '', type: 'varchar', isPrimary: false, isForeign: false });
  const [contextMenu, setContextMenu] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const addColumn = () => {
    if (newColumn.name) {
      setColumns([...columns, { ...newColumn }]);
      setNewColumn({ name: '', type: 'varchar', isPrimary: false, isForeign: false });
    }
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
    });
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleDuplicate = () => {
    if (data.onDuplicate) {
      data.onDuplicate(id);
    }
    handleClose();
  };

  const handleDelete = () => {
    if (data.onDelete) {
      data.onDelete(id);
    }
    handleClose();
  };

  const removeColumn = (index) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 1,
        width: 240,
        backgroundColor: 'background.paper',
        cursor: 'default',
        color: 'text.primary',
        position: 'relative',
        '& .react-flow__handle': {
          opacity: 0,
          transition: 'opacity 0.2s'
        },
        '&:hover .react-flow__handle': {
          opacity: 1
        }
      }}
      onContextMenu={handleContextMenu}
    >
      {/* Connection handles - one per side that works as both source and target */}
      <Handle
        type="target"
        position="left"
        id="left"
        style={{ 
          left: -4,
          top: '50%',
          width: 8,
          height: 8,
          background: '#666',
          transform: 'translateY(-50%)'
        }}
      />
      <Handle
        type="source"
        position="left"
        id="left-source"
        style={{ 
          left: -4,
          top: '50%',
          width: 8,
          height: 8,
          background: '#666',
          transform: 'translateY(-50%)'
        }}
      />
      <Handle
        type="target"
        position="right"
        id="right"
        style={{ 
          right: -4,
          top: '50%',
          width: 8,
          height: 8,
          background: '#666',
          transform: 'translateY(-50%)'
        }}
      />
      <Handle
        type="source"
        position="right"
        id="right-source"
        style={{ 
          right: -4,
          top: '50%',
          width: 8,
          height: 8,
          background: '#666',
          transform: 'translateY(-50%)'
        }}
      />
      <Handle
        type="target"
        position="top"
        id="top"
        style={{ 
          top: -4,
          left: '50%',
          width: 8,
          height: 8,
          background: '#666',
          transform: 'translateX(-50%)'
        }}
      />
      <Handle
        type="source"
        position="top"
        id="top-source"
        style={{ 
          top: -4,
          left: '50%',
          width: 8,
          height: 8,
          background: '#666',
          transform: 'translateX(-50%)'
        }}
      />
      <Handle
        type="target"
        position="bottom"
        id="bottom"
        style={{ 
          bottom: -4,
          left: '50%',
          width: 8,
          height: 8,
          background: '#666',
          transform: 'translateX(-50%)'
        }}
      />
      <Handle
        type="source"
        position="bottom"
        id="bottom-source"
        style={{ 
          bottom: -4,
          left: '50%',
          width: 8,
          height: 8,
          background: '#666',
          transform: 'translateX(-50%)'
        }}
      />
      <Box sx={{
        p: 0.5,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
        color: 'text.primary'
      }} onClick={() => setEditMode(true)}>
        {editMode ? (
          <TextField
            size="small"
            fullWidth
            value={data.label}
            onChange={(e) => data.onLabelChange && data.onLabelChange(id, e.target.value)}
            onBlur={() => setEditMode(false)}
            onKeyPress={(e) => e.key === 'Enter' && setEditMode(false)}
            autoFocus
            sx={{ '& .MuiInputBase-input': { py: 0.25, fontSize: '1rem' } }}
          />
        ) : (
          <Typography variant="body2" align="center" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
            {data.label}
          </Typography>
        )}
      </Box>
      <List dense sx={{ py: 0, fontSize: '0.75rem' }}>
        {columns.map((column, index) => (
          <ListItem
            key={index}
            dense
            sx={{ 
              py: 0.75,
              minHeight: '36px',
              position: 'relative',
              '&:hover .column-handles': {
                opacity: 1
              }
            }}
            secondaryAction={
              <Box sx={{ display: 'flex', gap: 0.25, mr: -1 }}>
                <IconButton
                  size="small"
                  title="Toggle Primary Key"
                  onClick={() => {
                    const newColumns = [...columns];
                    if (!newColumns[index].isPrimary) {
                      // Remove primary key from other columns
                      newColumns.forEach(col => col.isPrimary = false);
                    }
                    newColumns[index].isPrimary = !newColumns[index].isPrimary;
                    setColumns(newColumns);
                  }}
                  sx={{ p: 0.75 }}
                >
                  <KeyIcon
                    sx={{ fontSize: '1rem' }}
                    color={column.isPrimary ? 'primary' : 'disabled'}
                  />
                </IconButton>
                <IconButton
                  size="small"
                  title="Toggle Foreign Key"
                  onClick={() => {
                    // Prevent id from being set as foreign key
                    if (column.name.toLowerCase() === 'id') {
                      return;
                    }
                    const newColumns = [...columns];
                    newColumns[index].isForeign = !newColumns[index].isForeign;
                    setColumns(newColumns);
                  }}
                  sx={{ p: 0.75 }}
                >
                  <LinkIcon
                    sx={{ fontSize: '1rem' }}
                    color={column.isForeign ? 'secondary' : 'disabled'}
                  />
                </IconButton>
                <IconButton 
                  size="small" 
                  edge="end" 
                  onClick={() => removeColumn(index)}
                  sx={{ p: 0.75 }}
                >
                  <DeleteIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </Box>
            }
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              width: '100%',
              position: 'relative',
              pr: 7 // Add right padding to prevent text overlap with badges
            }}>
              <Typography sx={{
                fontSize: '0.75rem',
                color: column.isPrimary ? 'primary.main' : 
                       column.isForeign ? 'secondary.main' : 'inherit',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {column.name} ({column.type})
              </Typography>
              <Box sx={{ 
                position: 'absolute',
                right: '55px',
                top: '0px',
                display: 'flex',
                gap: 0.5,
                zIndex: 1
              }}>
                {column.isPrimary && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.65rem',
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 0.5,
                      py: 0.1,
                      borderRadius: 0.5,
                      lineHeight: 1
                    }}
                  >
                    PK
                  </Typography>
                )}
                {column.isForeign && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.65rem',
                      bgcolor: 'secondary.main',
                      color: 'white',
                      px: 0.5,
                      py: 0.1,
                      borderRadius: 0.5,
                      lineHeight: 1
                    }}
                  >
                    FK
                  </Typography>
                )}
              </Box>
              {/* Connection points only at table borders */}
            </Box>
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1, px: 1, width: '100%' }}>
        <TextField
          size="small"
          placeholder="Column name"
          value={newColumn.name}
          onChange={(e) =>
            setNewColumn({ ...newColumn, name: e.target.value })
          }
          onKeyPress={(e) => e.key === 'Enter' && addColumn()}
          sx={{ 
            '& .MuiInputBase-input': { 
              py: 0.75,
              fontSize: '0.8rem',
              height: 'unset'
            },
            width: '60%'
          }}
        />
        <select
          value={newColumn.type}
          onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value })}
          style={{
            fontSize: '0.8rem',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            width: '30%',
            height: '36px',
            backgroundColor: 'background.paper',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="varchar">VARCHAR</option>
          <option value="integer">INTEGER</option>
          <option value="boolean">BOOLEAN</option>
          <option value="date">DATE</option>
          <option value="decimal">DECIMAL</option>
          <option value="text">TEXT</option>
        </select>
        <IconButton 
          size="small" 
          onClick={addColumn}
          sx={{ 
            width: '10%',
            height: '36px'
          }}
        >
          <AddIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      </Box>

      
      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => {
          // Call the duplicate function from props
          if (data.onDuplicate) {
            data.onDuplicate(id);
          }
          setContextMenu(null);
        }}>Duplicate</MenuItem>
      </Menu>
    </Paper>
  );
};

export default TableNode;
