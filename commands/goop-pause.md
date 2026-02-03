---
name: goop-pause
description: Save a checkpoint to pause work
---

# GoopSpec Pause (Checkpoint)

Save your current progress as a checkpoint that you can resume later.

## Usage

```
/goop-pause [checkpoint-name]
```

## What Gets Saved

A checkpoint captures:
- Current session ID
- Current phase and spec
- Incomplete todos
- Modified files
- Git commit hash
- Timestamp

## Storage

Checkpoints are saved to:
`.goopspec/checkpoints/checkpoint-{id}.json`

## Auto-Cleanup

Old checkpoints are automatically cleaned up (configurable limit, default 10).

## Example

```
/goop-pause "Before major refactor"
```

## Resume Later

To resume from this checkpoint:
```
/goop-resume [checkpoint-id]
```

Or resume the latest:
```
/goop-resume
```

## Use Cases

- End of work day - save and resume tomorrow
- Before experimental changes - save as backup
- Context switching - pause one task, work on another

---

**GoopSpec**: Never lose your place.
