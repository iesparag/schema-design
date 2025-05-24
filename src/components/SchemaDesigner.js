import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  getRectOfNodes,
  getTransformForBounds,
} from 'reactflow';
import 'reactflow/dist/style.css';
import TableNode from './TableNode';
import { Box, Button, ButtonGroup, Snackbar } from '@mui/material';
import { toPng, toSvg } from 'html-to-image';
import SaveIcon from '@mui/icons-material/Save';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ImageIcon from '@mui/icons-material/Image';

const nodeTypes = {
  tableNode: TableNode,
};

// Removed SQL export functionality
/*const generateSqlDDL = (nodes, edges) => {
  let sql = '';
  
  // Create tables
  nodes.forEach((node) => {
    sql += `CREATE TABLE ${node.data.label} (\n`;
    const columns = node.data.columns.map((col) => {
      let colDef = `  ${col.name} ${col.type.toUpperCase()}`;
      if (col.isPrimary) colDef += ' PRIMARY KEY';
      return colDef;
    });
    sql += columns.join(',\n');
    sql += '\n);\n\n';
  });

  // Add foreign key constraints
  edges.forEach((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (sourceNode && targetNode) {
      sql += `ALTER TABLE ${sourceNode.data.label}\n`;
      sql += `  ADD FOREIGN KEY (${edge.sourceHandle}) REFERENCES ${targetNode.data.label}(${edge.targetHandle});\n\n`;
    }
  });

  return sql;
};*/

const SchemaDesigner = ({ mode }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useRef(null);

  const onConnect = useCallback((params) => {
    const sourceNode = nodes.find((node) => node.id === params.source);
    const targetNode = nodes.find((node) => node.id === params.target);
    const sourceColumnIndex = parseInt(params.sourceHandle);
    const targetColumnIndex = parseInt(params.targetHandle);

    if (sourceNode && targetNode && !isNaN(sourceColumnIndex) && !isNaN(targetColumnIndex)) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === targetNode.id) {
            const updatedColumns = node.data.columns.map((col, idx) => {
              if (idx === targetColumnIndex) {
                return { 
                  ...col, 
                  isForeign: true,
                  referencedTable: sourceNode.data.label,
                  referencedColumn: sourceNode.data.columns[sourceColumnIndex].name
                };
              }
              return col;
            });
            return {
              ...node,
              data: { ...node.data, columns: updatedColumns },
            };
          }
          return node;
        })
      );
    }

    setEdges((eds) => 
      addEdge({
        ...params,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#999' }
      }, eds)
    );
  }, [nodes, setNodes, setEdges]);

  const addNewTable = () => {
    const position = nodes.length > 0
      ? {
          x: nodes[nodes.length - 1].position.x + 50,
          y: nodes[nodes.length - 1].position.y + 50
        }
      : { x: 50, y: 50 };

    const newNode = {
      id: `table-${nodes.length + 1}`,
      type: 'tableNode',
      position,
      data: {
        label: `Table ${nodes.length + 1}`,
        columns: [{ name: 'id', type: 'ObjectId', isPrimary: true }],
        onDelete: deleteNode,
        onDuplicate: duplicateNode,
        onLabelChange: updateTableName,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const deleteNode = useCallback(
    (id) => {
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    },
    [setNodes, setEdges]
  );

  const duplicateNode = useCallback(
    (id) => {
      const nodeToDuplicate = nodes.find((node) => node.id === id);
      if (nodeToDuplicate) {
        const newNode = {
          ...nodeToDuplicate,
          id: `table-${nodes.length + 1}`,
          position: {
            x: nodeToDuplicate.position.x + 50,
            y: nodeToDuplicate.position.y + 50,
          },
        };
        setNodes((nds) => [...nds, newNode]);
      }
    },
    [nodes, setNodes]
  );

  const updateTableName = useCallback(
    (id, newName) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return { ...node, data: { ...node.data, label: newName } };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const saveSchema = useCallback(() => {
    const schema = { nodes, edges };
    localStorage.setItem('savedSchema', JSON.stringify(schema));
    setSnackbarMessage('Schema saved successfully!');
  }, [nodes, edges, setSnackbarMessage]);

  const loadSchema = () => {
    const savedSchema = localStorage.getItem('savedSchema');
    if (savedSchema) {
      const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedSchema);
      setNodes(savedNodes);
      setEdges(savedEdges);
      setSnackbarMessage('Schema loaded successfully!');
    }
  };

  const exportImage = async (type) => {
    const nodesBounds = getRectOfNodes(nodes);
    const padding = 50; // Add padding around the nodes
    const width = nodesBounds.width + (padding * 2);
    const height = nodesBounds.height + (padding * 2);
    
    // Calculate transform to center the nodes with padding
    const transform = getTransformForBounds(
      nodesBounds,
      width - padding * 2,
      height - padding * 2,
      0.95 // Slightly larger scale to ensure everything fits
    );
    
    const exportFunc = type === 'png' ? toPng : toSvg;
    try {
      const dataUrl = await exportFunc(reactFlowWrapper.current, {
        backgroundColor: window.getComputedStyle(document.body).backgroundColor,
        width: width,
        height: height,
        style: {
          transform: `translate(${transform[0] + padding}px, ${transform[1] + padding}px) scale(${transform[2]})`,
        },
        quality: 1,
        pixelRatio: 2
      });
      
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `schema.${type}`;
      a.click();
      
      setSnackbarMessage(`Schema exported as ${type.toUpperCase()}!`);
    } catch (error) {
      console.error('Error exporting image:', error);
      setSnackbarMessage('Error exporting image. Please try again.');
    }
  };

  /*const exportSQL = () => {
    const sql = generateSqlDDL(nodes, edges);
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.sql';
    a.click();
    window.URL.revokeObjectURL(url);
    setSnackbarMessage('SQL DDL exported successfully!');
  };*/

  return (
    <Box sx={{ width: '100vw', height: '100vh' }} ref={reactFlowWrapper}>
      <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 4, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={addNewTable}>
          Add Table
        </Button>
        <ButtonGroup variant="contained">
          <Button onClick={saveSchema} startIcon={<SaveIcon />}>
            Save
          </Button>
          <Button onClick={loadSchema} startIcon={<FileUploadIcon />}>
            Load
          </Button>
        </ButtonGroup>
        <ButtonGroup variant="contained">
          <Button onClick={() => exportImage('png')} startIcon={<ImageIcon />}>
            Export PNG
          </Button>
          <Button onClick={() => exportImage('svg')} startIcon={<ImageIcon />}>
            Export SVG
          </Button>

        </ButtonGroup>
      </Box>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onInit={(instance) => (reactFlowInstance.current = instance)}
        fitView
        proOptions={{ hideAttribution: true }}
        style={{
          backgroundColor: mode === 'dark' ? '#121212' : '#fff'
        }}
      >
        <Controls />
        <MiniMap />
        <Background
          variant="dots"
          gap={12}
          size={1}
          color={mode === 'dark' ? '#333' : '#eee'}
        />
      </ReactFlow>
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default SchemaDesigner;
