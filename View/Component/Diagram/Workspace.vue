<script setup lang="ts">
	import { Transform } from "../../Composable/Transform";
	import Diagram from "../../../Model/Diagram";

	const { diagram, transform } = defineProps<{
		diagram: Diagram;
		transform: Transform;
	}>();

	function pan(event: MouseEvent) {
		const workspace = event.target as HTMLDivElement;
		const [ cx, cy ] = [ event.clientX, event.clientY ];
		const [ px, py ] = [ transform.x, transform.y ];
		workspace.onmouseup = () => {
			workspace.onmouseup = null;
			workspace.onmousemove = null;
		};
		workspace.onmousemove = (event) => {
			const [ dx, dy ] = [ event.clientX - cx, event.clientY - cy ].map(x => x / transform.scale);
			transform.x = px + dx;
			transform.y = py + dy;
		};
	}
	function zoom(event: WheelEvent) {
		if (event.buttons) return; // Prevent scroll while dragging.
		event.deltaY > 0 ? transform.zoomOut() : transform.zoomIn();
	}
</script>
<template>
	<div class="workspace" ref="workspace" @mousedown="pan" @wheel="zoom">
	</div>
</template>
<style scoped>
	.workspace {
		position: absolute;
		width: 100%;
		height: 100%;
		overflow: hidden;
		z-index: 1;
		cursor: move;
		--px: v-bind("transform.x");
		--py: v-bind("transform.y");
		--scale: v-bind("transform.scale");
	}
</style>