<template>
  <div class="canvas-container">
    <div class="toolbar main-toolbar">
      <input 
        type="text" 
        :value="whiteboardProp.name" 
        @input="$emit('update:name', $event.target.value)" 
        class="wb-name-input" 
        placeholder="Nome da Lousa"
      />
      <div class="tool-group">
        <button @click="toggleDrawMode" :class="{ active: isDrawingMode }">
          {{ isDrawingMode ? 'Modo Seleção' : 'Desenhar' }}
        </button>
        <input v-if="isDrawingMode" type="color" v-model="drawingColor" title="Cor do Pincel" />
        <input v-if="isDrawingMode" type="range" min="1" max="50" v-model="drawingWidth" title="Tamanho do Pincel" />
      </div>
      <div class="tool-group">
        <button @click="addRect">Retângulo</button>
        <button @click="addCircle">Círculo</button>
        <button @click="addText">Texto</button>
      </div>
      <div class="tool-group">
        <button @click="addLine">Linha</button>
        <button @click="addArrow">Seta</button>
      </div>
      <button @click="deleteSelected" class="danger">Deletar Selecionado</button>
      <div class="spacer"></div>
      <div class="help-text">
        <strong>Alt + Arrastar</strong> para mover | <strong>Ctrl + Roda Mouse</strong> para zoom
      </div>
    </div>

    <div v-if="activeObject" class="toolbar contextual-toolbar">
      <div v-if="isShape" class="tool-group">
        <label for="fill-color">Cor:</label>
        <input type="color" id="fill-color" v-model="fillColor" />
      </div>
      <div v-if="isText" class="tool-group">
        <label for="text-color">Cor:</label>
        <input type="color" id="text-color" v-model="fillColor" />
        <select v-model="fontSize" title="Tamanho da Fonte">
          <option>12</option><option>16</option><option>24</option><option>36</option><option>48</option><option>72</option>
        </select>
        <button @click="toggleBold" :class="{ active: isBold }"><b>B</b></button>
        <button @click="toggleItalic" :class="{ active: isItalic }"><i>I</i></button>
      </div>
    </div>

    <div class="canvas-wrapper" ref="canvasWrapper">
      <canvas ref="canvasEl"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as fabric from 'fabric';

const props = defineProps({
  whiteboardProp: Object
});
const emit = defineEmits(['update:name', 'content-changed']);

const canvasEl = ref(null);
const canvasWrapper = ref(null);
let fabricCanvas = null;

const isDrawingMode = ref(false);
const drawingColor = ref('#000000');
const drawingWidth = ref(5);

let isPanning = false;
let lastPosX = 0;
let lastPosY = 0;

const activeObject = ref(null);

const onCanvasChange = () => {
  if (!fabricCanvas) return;
  const content = fabricCanvas.toObject();
  emit('content-changed', content);
};

onMounted(() => {
  fabricCanvas = new fabric.Canvas(canvasEl.value, {
    width: canvasWrapper.value.clientWidth,
    height: canvasWrapper.value.clientHeight,
  });
  
  const gridPatternSVG = `data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23e9ecef' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E`;
  fabric.util.loadImage(gridPatternSVG, (img) => {
    fabricCanvas.backgroundColor = new fabric.Pattern({ source: img, repeat: 'repeat' });
    fabricCanvas.renderAll();
  });

  if (props.whiteboardProp.content && Object.keys(props.whiteboardProp.content).length > 0) {
    fabricCanvas.loadFromJSON(props.whiteboardProp.content, () => fabricCanvas.renderAll());
  }

  fabricCanvas.on({
    'object:modified': onCanvasChange,
    'path:created': onCanvasChange,
    'object:added': onCanvasChange,
    'object:removed': onCanvasChange,
    'selection:created': (e) => activeObject.value = e.selected[0],
    'selection:updated': (e) => activeObject.value = e.selected[0],
    'selection:cleared': () => activeObject.value = null
  });
  
  fabricCanvas.on('mouse:wheel', function(opt) {
    if (opt.e.ctrlKey) {
      const delta = opt.e.deltaY;
      let zoom = this.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.05) zoom = 0.05;
      this.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    }
  });

  fabricCanvas.on('mouse:down', function(opt) {
    const evt = opt.e;
    if (evt.altKey && !this.isDrawingMode) {
      isPanning = true;
      this.selection = false;
      this.setCursor('grabbing');
      lastPosX = evt.clientX;
      lastPosY = evt.clientY;
    }
  });

  fabricCanvas.on('mouse:move', function(opt) {
    if (isPanning) {
      const e = opt.e;
      const vpt = this.viewportTransform;
      vpt[4] += e.clientX - lastPosX;
      vpt[5] += e.clientY - lastPosY;
      this.requestRenderAll();
      lastPosX = e.clientX;
      lastPosY = e.clientY;
    }
  });

  fabricCanvas.on('mouse:up', function(opt) {
    if (isPanning) {
      this.setViewportTransform(this.viewportTransform);
      isPanning = false;
      this.selection = true;
      this.setCursor('default');
      this.renderAll();
      onCanvasChange();
    }
  });
  
  const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      fabricCanvas.setDimensions({ width, height });
  });
  resizeObserver.observe(canvasWrapper.value);

  onUnmounted(() => {
    if (fabricCanvas) {
      fabricCanvas.dispose();
    }
    resizeObserver.disconnect();
  });
});

const toggleDrawMode = () => {
  isDrawingMode.value = !isDrawingMode.value;
  if (fabricCanvas) {
    fabricCanvas.isDrawingMode = isDrawingMode.value;
    if (isDrawingMode.value) {
      fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
      fabricCanvas.freeDrawingBrush.color = drawingColor.value;
      fabricCanvas.freeDrawingBrush.width = parseInt(drawingWidth.value, 10);
    }
  }
};
watch(drawingColor, (val) => { if (fabricCanvas?.freeDrawingBrush) { fabricCanvas.freeDrawingBrush.color = val; } });
watch(drawingWidth, (val) => { if (fabricCanvas?.freeDrawingBrush) { fabricCanvas.freeDrawingBrush.width = parseInt(val, 10); } });

const addRect = () => { fabricCanvas.add(new fabric.Rect({ left: 100, top: 100, fill: 'rgba(255,0,0,0.7)', width: 100, height: 100, cornerColor: 'blue' })); };
const addCircle = () => { fabricCanvas.add(new fabric.Circle({ left: 150, top: 150, fill: 'rgba(0,0,255,0.7)', radius: 50, cornerColor: 'blue' })); };
const addText = () => { fabricCanvas.add(new fabric.IText('Edite-me', { left: 200, top: 200, fill: '#000' })); };
const addLine = () => {
  const line = new fabric.Line([50, 100, 250, 100], { stroke: 'black', strokeWidth: 2, cornerColor: 'blue' });
  fabricCanvas.add(line);
};
const addArrow = () => {
  const line = new fabric.Line([50, 100, 250, 100], { stroke: 'black', strokeWidth: 2 });
  const arrowHead = new fabric.Triangle({ left: 250, top: 100, originX: 'center', originY: 'center', width: 10, height: 10, fill: 'black', angle: 90 });
  const arrow = new fabric.Group([line, arrowHead], { left: 150, top: 150, cornerColor: 'blue' });
  fabricCanvas.add(arrow);
};
const deleteSelected = () => {
  if (fabricCanvas) {
    fabricCanvas.getActiveObjects().forEach(obj => fabricCanvas.remove(obj));
    fabricCanvas.discardActiveObject().renderAll();
  }
};

const isShape = computed(() => activeObject.value && ['rect', 'circle', 'line', 'group'].includes(activeObject.value.type));
const isText = computed(() => activeObject.value && activeObject.value.type === 'i-text');

const fillColor = computed({
  get: () => activeObject.value?.get('fill'),
  set: (value) => { activeObject.value?.set('fill', value); fabricCanvas.renderAll(); onCanvasChange(); }
});
const fontSize = computed({
  get: () => activeObject.value?.get('fontSize'),
  set: (value) => { activeObject.value?.set('fontSize', parseInt(value, 10)); fabricCanvas.renderAll(); onCanvasChange(); }
});
const isBold = computed(() => activeObject.value?.get('fontWeight') === 'bold');
const toggleBold = () => {
  const isCurrentlyBold = activeObject.value?.get('fontWeight') === 'bold';
  activeObject.value?.set('fontWeight', isCurrentlyBold ? 'normal' : 'bold');
  fabricCanvas.renderAll();
  onCanvasChange();
};
const isItalic = computed(() => activeObject.value?.get('fontStyle') === 'italic');
const toggleItalic = () => {
  const isCurrentlyItalic = activeObject.value?.get('fontStyle') === 'italic';
  activeObject.value?.set('fontStyle', isCurrentlyItalic ? 'normal' : 'italic');
  fabricCanvas.renderAll();
  onCanvasChange();
};
</script>

<style scoped>
.canvas-container { display: flex; flex-direction: column; height: 100%; }
.toolbar { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; padding: 0.5rem 1rem; background: #f8f9fa; border-bottom: 1px solid #dee2e6; flex-shrink: 0; z-index: 10; }
.contextual-toolbar { background: #e9ecef; }
.tool-group { display: flex; gap: 0.5rem; align-items: center; }
.tool-group label { font-size: 0.8rem; font-weight: bold; }
button { padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid #ccc; background: #fff; cursor: pointer; }
button.active { background: #007bff; color: white; border-color: #007bff; }
button.danger { background: #f8d7da; color: #721c24; border-color: #f5c6cb; }
.wb-name-input { font-weight: bold; border: 1px solid #ccc; padding: 0.5rem; border-radius: 4px; }
.canvas-wrapper { flex-grow: 1; position: relative; cursor: default; }
.canvas-wrapper:active { cursor: grabbing; }
.canvas-wrapper canvas { position: absolute; }
.spacer { flex-grow: 1; }
.help-text { font-size: 0.8rem; color: #6c757d; }
</style>