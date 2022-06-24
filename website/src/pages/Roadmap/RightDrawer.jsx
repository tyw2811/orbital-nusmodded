import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  Button,
  Box,
  Drawer,
  CssBaseline,
  Typography,
  Divider,
  IconButton,
  Paper,
} from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddModules from "./AddModules";
import { ModuleStack as ModStack } from "../../components/Mod";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import RoadmapFab from "./RoadmapFab";

const drawerWidth = 350;



export default function DrawerRight({roadMap, handleAdd, loadingProfile, allMods, handleDelete}) {
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

{/* <Button sx = {{position: "absolute", top: '45%', right: "-1%", zIndex: 2000, transform: 'rotate(-90deg)', height: 50, width: 150}} >
  <Typography noWrap>Add modules</Typography>
</Button> */}

  return (
    <Box sx={{ display: 'flex' }}>
      { !open &&
        <RoadmapFab onClick={handleDrawerOpen}/>
      }
      <Drawer
        sx={{
          width: "auto",
          height: "auto",
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
          },
        }}
        BackdropProps={{ invisible: true }}
        variant="persistent"
        anchor="right"
        open={open}
        onClose={handleDrawerClose}
        elevation = "0"
      >
      <Droppable droppableId={"-1"} >
      {(provided, snapshot) => (
        <div {...provided.droppableProps} ref={provided.innerRef}>
        <Paper 
        sx={{ p: 2, top: 0, left: 0, minHeight: "93.2vh", overflowX: "hidden"}} 
        ref = {provided.innerRef} square
        elevation = {snapshot.isDraggingOver ? 40 : 8} 
        >
          <IconButton onClick={handleDrawerClose} sx ={{p: 1, left: "-4%", top: "-1%"}}>
            <ChevronRightIcon />
          </IconButton>
        <Divider />
          <AddModules sx={{zIndex: 2000}} 
            roadMap = {roadMap}
            handleAdd = {handleAdd} 
            loadingProfile = {loadingProfile} 
            allMods = {allMods}
            handleDelete = {handleDelete}
            />
        </Paper>
        </div>
      )}
      </Droppable>
      </Drawer>
    </Box>
  );
}
