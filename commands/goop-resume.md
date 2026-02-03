---
name: goop-resume
description: Resume from a checkpoint
---

# GoopSpec Resume

Resume your work from a saved checkpoint.

## Usage

```
/goop-resume [checkpoint-id]
```

## What Gets Restored

When resuming:
- Session context is restored
- Current phase is set
- Active spec is loaded
- Todos are displayed
- Modified files list is shown

## Without Checkpoint ID

If no checkpoint ID is provided, loads the **most recent** checkpoint.

## Example

```
/goop-resume
```

Or specify a specific checkpoint:
```
/goop-resume checkpoint-abc123
```

## Workflow

1. **Load checkpoint data**
2. **Restore session context**
3. **Display current todos**
4. **Show relevant files**
5. **Ready to continue work**

## See Available Checkpoints

To list all checkpoints:
```
Use the goop_checkpoint tool with action: "list"
```

---

**GoopSpec**: Pick up exactly where you left off.
