# pi-wrap-aware-home-end

An extension for [pi](https://pi.dev) that adds wrap-aware Home/End navigation to the editor, including Cmd+Left and Cmd+Right when mapped to those actions.

The first press moves to the start or end of the current visual (wrapped) line. Press again at that boundary to move to the start or end of the full logical line.

## Install

Clone the repository into pi's user extensions directory:

```sh
mkdir -p ~/.pi/agent/extensions
git clone https://github.com/filippo-orru/pi-wrap-aware-home-end.git \
  ~/.pi/agent/extensions/pi-wrap-aware-home-end
```

Restart pi, or run `/reload` in an existing session. Pi automatically loads the extension's `index.ts`; no build step is needed.

### Try without installing

From a local checkout:

```sh
pi --extension ~/dev/pi-wrap-aware-home-end/index.ts
```

## Update

```sh
git -C ~/.pi/agent/extensions/pi-wrap-aware-home-end pull
```

Then restart pi or run `/reload`.
