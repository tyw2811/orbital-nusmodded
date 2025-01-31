import { useEffect, useMemo, useState } from "react";
import {
  Stack,
  Typography,
  Box,
  Skeleton,
  Chip,
  useTheme,
  Divider,
  Collapse,
  Button,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { ModuleBox, ModuleStack as ModStack } from "../../components/Mod";
import { ModGroupStack } from "../../components/ModGroup";
import ModGroupBox from "./ModGroupBox";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import BookIcon from "@mui/icons-material/Book";
import BackpackIcon from "@mui/icons-material/Backpack";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import SchoolIcon from "@mui/icons-material/School";
import RightDrawer from "./RightDrawer";
import {
  useRoadmap,
  useCourse,
  useSettings,
  useSnackbar,
  useModGroup,
} from "../../providers";
import {
  COLORS,
  DIMENSIONS,
  ROADMAP,
  SEMESTER_TITLE,
  SETTINGS,
} from "../../utils/constants";
import SemesterOrderer from "./SemesterOrderer";
import { useNavigate } from "react-router-dom";
import LockButton from "./LockButton";
// import RoadmapGenerator from "./RoadmapGenerator";

export default function RoadmapStack() {
  const {
    loading,
    dragMods,
    getSemesters,
    getSemesterById,
    setModulesById,
    getAllMods,
  } = useRoadmap();
  const {
    loading: loadingCourse,
    getCourseMods,
    getCourseModGroups,
    getCourseId,
  } = useCourse();
  const { loading: loadingSettings, getSetting } = useSettings();
  const { pushSnack } = useSnackbar();

  const [locked, setLocked] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const [courseMods, setCourseMods] = useState([]);
  const [modGroups, setModGroups] = useState([]);
  let deletedSem = "";
  let deletedSemCodes = [];

  const allMods = getAllMods();

  const myMods = useMemo(
    () =>
      getSemesterById(ROADMAP.MY_MODS_ID)?.modules?.map((moduleCode) => ({
        moduleCode,
      })) || [],
    [getSemesterById]
  );

  const exemptedMods = useMemo(
    () =>
      getSemesterById(ROADMAP.EXEMPTED_MODS_ID)?.modules?.map((moduleCode) => ({
        moduleCode,
      })) || [],
    [getSemesterById]
  );

  const onDragEnd = ({ source, destination, draggableId }) => {
    if (!source || !destination) return;

    dragMods(
      source.index,
      source.droppableId,
      destination.index,
      destination.droppableId
    );
  };

  const handleAddMods =
    (semesterId) =>
    (moduleCodes = []) => {
      const targetSem = getSemesterById(semesterId);
      const newCodes = moduleCodes.filter((code) => !allMods.includes(code));

      const targetCodes = newCodes.concat(targetSem?.modules || []);
      setModulesById(semesterId, targetCodes);

      return newCodes;
    };

  const handleDeleteMod = (semesterId) => (moduleCode) => {
    const targetSem = getSemesterById(semesterId);
    const targetCodes =
      targetSem?.modules?.filter((code) => code !== moduleCode) || [];

    deletedSem = semesterId;
    deletedSemCodes = targetSem?.modules || [];
    setModulesById(semesterId, targetCodes);
  };

  const handleAddMyMods = handleAddMods(ROADMAP.MY_MODS_ID);
  const handleDeleteMyMod = handleDeleteMod(ROADMAP.MY_MODS_ID);

  const handleAddExemptedMods = handleAddMods(ROADMAP.EXEMPTED_MODS_ID);
  const handleDeleteExemptedMod = handleDeleteMod(ROADMAP.EXEMPTED_MODS_ID);

  const handleUndo = () => {
    if (deletedSem !== "" && deletedSemCodes !== []) {
      setModulesById(deletedSem, deletedSemCodes);
    }
  };

  const toggleLocked = () => setLocked((prev) => !prev);

  useEffect(() => {
    async function loadModGroups(courseId) {
      const data = await getCourseModGroups(courseId);
      setModGroups(data);
    }
    if (getCourseId() !== "") {
      loadModGroups(getCourseId());
    }
  }, [getCourseModGroups, getCourseId]);

  useEffect(() => {
    if (loading || loadingCourse || loadingSettings) return;

    loadCourseMods();

    async function loadCourseMods() {
      try {
        const courseId = getSetting(SETTINGS.COURSE.ID);
        setCourseId(courseId);
        if (!courseId) return;

        const mods = await getCourseMods(courseId);
        setCourseMods(mods);
      } catch (error) {
        console.error(error);
        pushSnack({
          message: "Unable to load modules for your course",
          severity: "warning",
        });
      }
    }
  }, [
    loading,
    loadingCourse,
    loadingSettings,
    getCourseMods,
    getSetting,
    pushSnack,
  ]);

  const handleCourseMods = () => {
    const visibleMods = courseMods.filter(
      (mod) => !getAllMods().includes(mod.moduleCode)
    );

    return (
      <Droppable droppableId={ROADMAP.COURSE_MODS_ID}>
        {(provided) => (
          <Stack
            spacing={2}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {visibleMods.length ? (
              visibleMods.map((mod, index) => (
                <ModuleBox
                  key={mod.moduleCode + ROADMAP.COURSE_MODS_ID}
                  moduleCode={mod.moduleCode}
                  isDraggable={!locked}
                  draggableId={mod.moduleCode + ROADMAP.COURSE_MODS_ID}
                  index={index}
                />
              ))
            ) : (
              <Box
                sx={{
                  width: 320,
                  borderStyle: "dashed",
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <Typography>All course modules have been added!</Typography>
              </Box>
            )}
            {provided.placeholder}
          </Stack>
        )}
      </Droppable>
    );
  };

  return (
    <>
      <Stack spacing={2} width="100%" alignItems="flex-start">
        <Stack direction="row" spacing={1}>
          <SemesterOrderer />
          <LockButton locked={locked} onToggle={toggleLocked} />
        </Stack>
        <DragDropContext onDragEnd={onDragEnd}>
          {loading ? (
            <SemesterSkeleton />
          ) : (
            getSemesters().map((sem) => (
              <Semester
                key={sem.id}
                sem={sem}
                onDeleteMod={handleDeleteMod(sem.id)}
                handleUndoMod={handleUndo}
                disableDrag={locked}
              />
            ))
          )}
          <RightDrawer
            items={[
              {
                icon: <BookIcon />,
                label: "My modules",
                description: "Modules you wish to take can be added below.",
              },
              {
                icon: <SchoolIcon />,
                label: "Course modules",
                description:
                  "Modules from your course of choice will be shown below.",
              },
              {
                icon: <BackpackIcon />,
                label: "Course module groups",
                description:
                  "Module groups from your course of choice will be shown below.",
              },
              {
                icon: <NotInterestedIcon />,
                label: "Exempted modules",
                description:
                  "Modules you are exempted from or have already taken can be added below to appease the prerequisite checker.",
              },
            ]}
          >
            <ModStack
              mods={myMods}
              isDroppable={!locked}
              droppableId={ROADMAP.MY_MODS_ID}
              handleAddMods={handleAddMyMods}
              handleDeleteMod={handleDeleteMyMod}
              handleUndoMod={handleUndo}
              showSearch={false}
            />
            {courseId ? handleCourseMods() : <CourseItemPlaceholder />}
            {courseId ? (
              <ModGroupStack
                modGroups={modGroups}
                isDroppable={!locked}
                droppableId={ROADMAP.COURSE_MOD_GROUPS_ID}
                isCourse={true}
              />
            ) : (
              <CourseItemPlaceholder />
            )}
            <ModStack
              mods={exemptedMods}
              handleAddMods={handleAddExemptedMods}
              handleDeleteMod={handleDeleteExemptedMod}
              showSearch={false}
            />
          </RightDrawer>
        </DragDropContext>
        <Divider sx={{ width: "100%" }} />
      </Stack>
      {/* <RoadmapGenerator /> */}
    </>
  );
}

function Semester({
  sem,
  onDeleteMod = (moduleCode) => {},
  handleUndoMod = async () => {},
  disableDrag = false,
}) {
  const { id, year, semester, modules, bgColor } = sem;
  const { isModGroupString } = useModGroup();
  const { pushSnack } = useSnackbar();

  const isDarkTheme = useTheme().palette.mode === "dark";
  const bgHex = COLORS[bgColor || "deepOrange"][isDarkTheme ? 900 : 100];

  const handleUndo = async () => {
    try {
      await handleUndoMod();
      pushSnack({
        message: `Delete undone!`,
        severity: "success",
      });
    } catch (error) {
      console.error(error);
      pushSnack({
        message: error.message || `Unable to undo delete!`,
        severity: "error",
      });
    }
  };

  const handleDeleteMod = (moduleCode) => () => {
    try {
      onDeleteMod(moduleCode);
      pushSnack({
        message: `${moduleCode} deleted!`,
        severity: "success",
        action: (
          <Button color="inherit" size="small" onClick={handleUndo}>
            Undo
          </Button>
        ),
      });
    } catch (error) {
      console.error(error);
      pushSnack({
        message: `Unable to delete ${moduleCode}.`,
        severity: "error",
      });
    }
  };

  return (
    <Stack
      spacing={1}
      alignItems="flex-start"
      bgcolor={bgHex}
      borderRadius={2}
      boxShadow={2}
      maxWidth="100%"
    >
      <Stack direction="row" spacing={1} pt={1} px={1}>
        <Chip
          label={`Year ${year || "?"} ${
            Object.keys(SEMESTER_TITLE)
              .map((key) => parseInt(key))
              .includes(semester)
              ? SEMESTER_TITLE[semester]
              : "Semester ?"
          }`}
        />
        <Chip label={`${modules?.length ?? 0} module(s)`} />
      </Stack>
      <Stack alignItems="flex-start" maxWidth="100%" overflow="auto">
        <Droppable droppableId={id} direction="horizontal">
          {(provided) => (
            <Stack
              spacing={1}
              direction="row"
              alignItems="flex-start"
              {...provided.droppableProps}
              ref={provided.innerRef}
              p={1}
            >
              {modules?.map((moduleCode, index) =>
                isModGroupString(moduleCode) ? (
                  <ModGroupBox
                    name={moduleCode}
                    key={moduleCode}
                    index={index}
                    isDraggable={!disableDrag}
                  />
                ) : (
                  <ModuleBox
                    moduleCode={moduleCode}
                    key={moduleCode}
                    index={index}
                    isDraggable={!disableDrag}
                    actions={
                      <Button
                        color="error"
                        onClick={handleDeleteMod(moduleCode)}
                      >
                        Delete
                      </Button>
                    }
                  />
                )
              )}
              {provided.placeholder}
              <ModulePlaceholer show={!modules?.length} />
            </Stack>
          )}
        </Droppable>
      </Stack>
    </Stack>
  );
}

function ModulePlaceholer({ show = false }) {
  const isDarkTheme = useTheme().palette.mode === "dark";

  return (
    <Collapse in={show} orientation="horizontal" unmountOnExit>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderColor: grey[isDarkTheme ? 200 : 600],
          borderRadius: 1,
          borderStyle: "dashed",
          py: 4,
          width: DIMENSIONS.BOX_WIDTH,
        }}
      >
        <Stack direction="row" spacing={1}>
          <ArrowLeftIcon />
          <Typography>Drag modules here</Typography>
        </Stack>
      </Box>
    </Collapse>
  );
}

function SemesterSkeleton() {
  return (
    <Stack spacing={2} width="100%">
      {[...Array(4).keys()].map((key) => (
        <Skeleton key={key} variant="rectangular" width="100%">
          <Box sx={{ width: "100%", height: 160 }} />
        </Skeleton>
      ))}
    </Stack>
  );
}

function CourseItemPlaceholder() {
  const navigate = useNavigate();

  const handleNavigateSettings = () => navigate("/settings");

  return (
    <Box sx={{ width: 320 }}>
      <Typography>
        Please choose a course from
        <Button onClick={handleNavigateSettings}>Settings</Button>
      </Typography>
    </Box>
  );
}
