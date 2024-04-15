import {
	DefaultKeyboardShortcutsDialog,
	DefaultKeyboardShortcutsDialogContent,
	TLComponents,
	TLUiOverrides,
	TldrawUiMenuItem,
	toolbarItem,
	useTools,
} from 'tldraw'

export const uiOverrides: TLUiOverrides = {
	tools(editor, tools) {
        tools.frame1 = {
			id: 'frame1',
			icon: 'color',
			label: 'frame1',
			kbd: 'c',
			onSelect: () => {
				editor.setCurrentTool('frame1')
			},
		}
		return tools
	},
	toolbar(_app, toolbar, { tools }) {
		// Add the tool item from the context to the toolbar.
		toolbar.splice(4, 0, toolbarItem(tools.frame1))
		return toolbar
	},
}

export const components: TLComponents = {
	KeyboardShortcutsDialog: (props) => {
		const tools = useTools()
		return (
			<DefaultKeyboardShortcutsDialog {...props}>
				<DefaultKeyboardShortcutsDialogContent />
				{/* Ideally, we'd interleave this into the tools group */}
				<TldrawUiMenuItem {...tools['frame1']} />
			</DefaultKeyboardShortcutsDialog>
		)
	},
}

/* 

This file contains overrides for the Tldraw UI. These overrides are used to add your custom tools
to the toolbar and the keyboard shortcuts menu.

We do this by providing a custom toolbar override to the Tldraw component. This override is a 
function that takes the current editor, the default toolbar items, and the default tools. 
It returns the new toolbar items. We use the toolbarItem helper to create a new toolbar item
for our custom tool. We then splice it into the toolbar items array at the 4th index. This puts 
it after the eraser tool. We'll pass our overrides object into the Tldraw component's `overrides` 
prop.


*/