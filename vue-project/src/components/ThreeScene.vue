<template>
  <div ref="sceneContainer"></div>
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue';
import * as THREE from 'three';

export default {
  name: 'ThreeScene',
  setup() {
    const sceneContainer = ref(null);
    let scene, camera, renderer, animationId;

    const initScene = () => {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      sceneContainer.value.appendChild(renderer.domElement);

      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      const animate = () => {
        animationId = requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
      };

      animate();
    };

    const onWindowResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    onMounted(() => {
      initScene();
      window.addEventListener('resize', onWindowResize);
    });

    onUnmounted(() => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
      window.removeEventListener('resize', onWindowResize);
    });

    return {
      sceneContainer,
    };
  },
};
</script>

<style scoped>
div {
  overflow: hidden;
}
</style>