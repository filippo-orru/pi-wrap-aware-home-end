# pi-wrap-aware-home-end

An extension for [pi](https://pi.dev) that adds wrap-aware Home/End navigation to the editor, including Cmd+Left and Cmd+Right when mapped to those actions.

The first press moves to the start or end of the current visual (wrapped) line. Press again at that boundary to move to the start or end of the full logical line.

## Install

Install with pi's package manager:

```sh
pi install git:github.com/filippo-orru/pi-wrap-aware-home-end
```

This installs the extension for all your projects. Add `--local` to install it for the current project only.

Restart pi, or run `/reload` in an existing session. No build step is needed.

If you previously cloned this repository into `~/.pi/agent/extensions/`, move that checkout outside the extensions directory before installing the managed package to avoid loading the extension twice.

### Try without installing

From a local checkout:

```sh
pi --extension ~/dev/pi-wrap-aware-home-end/index.ts
```

## Update

```sh
pi update git:github.com/filippo-orru/pi-wrap-aware-home-end
```

Or update all managed packages with `pi update --extensions`. Then restart pi or run `/reload`.
