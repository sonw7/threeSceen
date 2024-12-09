<template>
    <div ref="threeContainer" class="three-container"></div>
  </template>
  
  <script>
  import * as THREE from 'three';
  
  export default {
    name: 'ThreeComponent',
    setup() {
      const threeContainer = ref(null);
      let scene, camera, renderer, animationFrameId;
  
      const initThree = () => {
        // 创建场景
        scene = new THREE.Scene();
  
        // 创建相机
        camera = new THREE.PerspectiveCamera(
          75, 
          threeContainer.value.clientWidth / threeContainer.value.clientHeight, 
          0.1, 
          1000
        );
        camera.position.z = 5;
  
        // 创建渲染器
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(
          threeContainer.value.clientWidth,
          threeContainer.value.clientHeight
        );
        threeContainer.value.appendChild(renderer.domElement);
  
        // 添加一个简单的立方体
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
  
        // 动画循环
        const animate = () => {
          animationFrameId = requestAnimationFrame(animate);
  
          // 添加旋转动画
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
  
          renderer.render(scene, camera);
        };
        animate();
      };
  
      onMounted(() => {
        initThree();
      });
  
      onUnmounted(() => {
        // 清理资源
        cancelAnimationFrame(animationFrameId);
        renderer.dispose();
        scene = null;
        camera = null;
        renderer = null;
      });
  
      return {
        threeContainer,
      };
    },
  };
  </script>
  
  <style>
  .three-container {
    width: 100%;
    height: 100%;
    position: relative;
  }
  </style>