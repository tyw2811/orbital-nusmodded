import { useCallback, useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  Box,
  Card,
  Collapse,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Zoom,
  CardContent,
  CardActions,
  createFilterOptions,
  LinearProgress,
  Divider,
  InputAdornment,
} from "@mui/material";
import { TransitionGroup } from "react-transition-group";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import {
  useAuthSession,
  useMod,
  useModGroup,
  useSnackbar,
} from "../../providers";
import ModuleBox from "./ModuleBox";
import { Droppable } from "react-beautiful-dnd";
import ModGroupBox from "../../pages/Roadmap/ModGroupBox";
import { DIMENSIONS } from "../../utils/constants";

export default function ModuleStack({
  title = "Modules",
  mods,
  isDroppable = false,
  droppableId,
  handleAddMods = async (moduleCodes = []) => [],
  handleDeleteMod = async (moduleCode) => {},
  handleSelectMod = async (moduleCode) => {},
  handleUndoMod = async () => {},
  isCourse = false,
  isSelect = false,
  showSearch = true,
}) {
  const { isAuth, isAdmin } = useAuthSession();
  const { getModArray } = useMod();
  const { isModGroupString, parseModGroupString } = useModGroup();
  const { pushSnack } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modArray, setModArray] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const modArray = await getModArray();
        modArray.sort((mod1, mod2) =>
          mod1.moduleCode.localeCompare(mod2.moduleCode)
        );
        setModArray(modArray);
      } catch (error) {
        console.error(error);
        pushSnack({
          message: error.message || "Unable to load modules",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [getModArray, pushSnack]);

  const handleSearch = (e) => setSearch(e.target.value);
  const handleClearSearch = () => setSearch("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelected([]);
  };

  const handleAutocomplete = (e, value) => {
    setSelected(value);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const added = await handleAddMods(selected.map((mod) => mod.moduleCode));
      handleClose();
      const notAdded = selected
        .map((mod) => mod.moduleCode)
        .filter((mod) => !added.includes(mod));
      if (notAdded.length) {
        pushSnack({
          message: `${notAdded.join(", ")} already exists in the roadmap!`,
          severity: "error",
        });
      }
      if (Array.isArray(added) && added.length) {
        pushSnack({
          message: `${added.join(", ")} added!`,
          severity: "success",
        });
      }
    } catch (error) {
      console.error(error);
      pushSnack({
        message: error.message || "Unable to add modules",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const sortMods = useCallback(
    () =>
      mods.filter((mod) =>
        mod.moduleCode.includes((search || "").trim().toUpperCase())
      ).slice(0, 20),
    [mods, search]
  );

  const handleUndo = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (moduleCode) => async () => {
    setLoading(true);
    try {
      await handleDeleteMod(moduleCode);
      pushSnack({
        message: `${
          parseModGroupString(moduleCode)?.moduleCode ||
          parseModGroupString(moduleCode)?.name ||
          moduleCode
        } deleted!`,
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
        message: error.message || `Unable to delete ${moduleCode}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (moduleCode) => async () => {
    setLoading(true);

    try {
      const mod = await handleSelectMod(moduleCode);
      if (mod === moduleCode) {
        pushSnack({
          message: `${moduleCode} selected!`,
          severity: "success",
        });
      } else if (mod !== "") {
        pushSnack({
          message: `${moduleCode} already exists in the roadmap at ${mod}! `,
          severity: "error",
        });
      }
    } catch (error) {
      console.error(error);
      pushSnack({
        message: error.message || `Unable to select ${moduleCode}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const moduleList = (
    <TransitionGroup component={Stack} spacing={1}>
      {sortMods().map((mod, index) => (
        <Collapse key={mod.moduleCode}>
          {isModGroupString(mod.moduleCode) ? (
            <ModGroupBox
              name={mod.moduleCode}
              key={mod.moduleCode}
              index={index}
              isDraggable={true}
              actions={
                !isCourse || isAdmin() ? (
                  <>
                    <Button
                      color="error"
                      disabled={!isAuth() || loading}
                      onClick={handleDelete(mod.moduleCode)}
                    >
                      Delete
                    </Button>
                  </>
                ) : null
              }
            />
          ) : (
            <ModuleBox
              key={
                parseModGroupString(mod.moduleCode)?.moduleCode ||
                mod.moduleCode
              }
              index={index}
              moduleCode={
                parseModGroupString(mod.moduleCode)?.moduleCode ||
                mod.moduleCode
              }
              isDraggable={isDroppable}
              actions={
                <>
                  {isSelect ? (
                    <Button
                      color="primary"
                      disabled={!isAuth() || loading}
                      onClick={handleSelect(mod.moduleCode)}
                    >
                      Select
                    </Button>
                  ) : null}
                  {!isCourse || isAdmin() ? (
                    <Button
                      color="error"
                      disabled={!isAuth() || loading}
                      onClick={handleDelete(mod.moduleCode)}
                    >
                      Delete
                    </Button>
                  ) : null}
                </>
              }
            />
          )}
        </Collapse>
      ))}
    </TransitionGroup>
  );

  return (
    <Stack spacing={1} width={DIMENSIONS.BOX_WIDTH}>
      <Stack
        spacing={2}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h6">{title}</Typography>
        {!isCourse || isAdmin() ? (
          <Zoom in={!open}>
            <IconButton
              size="inherit"
              color="primary"
              onClick={handleOpen}
              disabled={!isAuth()}
            >
              <AddIcon />
            </IconButton>
          </Zoom>
        ) : null}
      </Stack>
      {showSearch ? (
        <TextField
          fullWidth
          size="small"
          margin="dense"
          label="Search module code"
          value={search}
          onChange={handleSearch}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Zoom in={!!search}>
                  <IconButton edge="end" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </Zoom>
              </InputAdornment>
            ),
          }}
        />
      ) : null}
      <Divider />
      <Collapse in={open}>
        <Card>
          <CardContent>
            <Autocomplete
              id="mod-select"
              autoHighlight
              fullWidth
              multiple
              onChange={handleAutocomplete}
              value={selected}
              options={modArray}
              getOptionLabel={(option) => option.moduleCode}
              isOptionEqualToValue={(option, value) =>
                option.moduleCode === value.moduleCode
              }
              renderOption={(props, option) => (
                <Tooltip
                  key={option.moduleCode}
                  title={option.title}
                  placement="left"
                >
                  <Box component="li" {...props}>
                    <Typography>{option.moduleCode}</Typography>
                  </Box>
                </Tooltip>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search modules"
                  placeholder="Add modules"
                  size="small"
                />
              )}
              filterOptions={createFilterOptions({ limit: 100 })}
            />
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              disabled={loading}
              onClick={handleSubmit}
            >
              Add
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
          </CardActions>
          {loading ? (
            <LinearProgress />
          ) : (
            <LinearProgress variant="determinate" value={100} />
          )}
        </Card>
      </Collapse>
      {isDroppable ? (
        <Droppable droppableId={`${droppableId}`}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {moduleList}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ) : (
        moduleList
      )}
      {sortMods().length ? null : (
        <Typography variant="body2">No modules.</Typography>
      )}
    </Stack>
  );
}
