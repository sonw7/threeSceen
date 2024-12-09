<template>
  <div ref="sceneContainer"></div>
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue';
import SceneManager from './SceneManager';

export default {
  name: 'ThreeScene',
  setup() {
    const sceneContainer = ref(null);
    let sceneManager;

    onMounted(() => {
      if (sceneContainer.value) {
        // 初始化管理类
        sceneManager = new SceneManager(sceneContainer.value);
        sceneManager.init();
 // 添加示例数据
 sceneManager.addData({
          type: 'points',
          data: [
            -4, -1, 0,
            -2, -1, 0,
            -3, 1, 0,
          ],
          layer: 'pointsLayer',
          options: { color: 0xff0000, size: 0.2 },
        });

        // 添加支持顶点索引的网格
        sceneManager.addData({
          type: 'indices',
          data: {
            vertices: [
              -1, -1, -10,
              1, -1, -10,
              0, 1, -10,
            ],
            indices: [0, 1, 2], // 定义三角形面
          },
          layer: 'indexedLayer',
          options: { color: 0x0000ff },
        });
         // 添加三角面数据
         sceneManager.addData({
          type: 'triangleMesh',
          data: {
            vertices: [
              3, -1, 0, // 顶点 0
              5, -1, 0,  // 顶点 1
              4, 1, 0,   // 顶点 2
            ],
            indices: [0, 1, 2], // 定义一个三角面
          },
          layer: 'triangleLayer',
          options: { color: "#5cf5d0" },
        });
        // sceneManager.addData({
        //   type: 'model',
        //   data: '/path/to/model.glb',
        //   layer: 'modelLayer',
        //   options: { scale: 2 },
        // });

        sceneManager.addData({
          type: 'custom',
          data: null,
          layer: 'customLayer',
          options: {
            renderFunction: (data, THREE) => {
              const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
              const material = new THREE.MeshBasicMaterial({ color:"#a375f5" });
              return new THREE.Mesh(geometry, material);
            },
          },
        });
        // 监听窗口大小变化
        window.addEventListener('resize', () => sceneManager.onWindowResize());
      }
    });

    onUnmounted(() => {
      // 清理资源
      if (sceneManager) {
        sceneManager.dispose();
      }

      window.removeEventListener('resize', () =>
        sceneManager.onWindowResize()
      );
    });

    return {
      sceneContainer,
    };
  },
};
</script>

<style scoped>
div {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
<!-- <template>
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
</style> -->