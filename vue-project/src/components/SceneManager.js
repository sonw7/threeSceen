import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animationId = null;
    this.dataLayers = new Map(); // 存储不同类型和层的数据
    this.loader = new GLTFLoader(); // 用于加载模型文件
    this.controls = null;
    this.transformControls = null;
    this.selectedObject = null; // 当前选中的对象

  }

  // 初始化场景
  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 5);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);


        // 添加轨道控制器
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true; // 启用阻尼效果
        this.controls.dampingFactor = 0.1;
    
        // 添加变换控制器
        this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
        this.transformControls.addEventListener('change', () => this.render());
        // this.scene.add(this.transformControls);
    
        // 添加交互事件
        this._addInteraction();

        
    this.animate();
  }

  // 动画循环
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.controls.update(); // 更新轨道控制器

    this.renderer.render(this.scene, this.camera);
  }
 // 添加交互事件
 _addInteraction() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    this.container.addEventListener('click', (event) => {
      const rect = this.container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(
        Array.from(this.dataLayers.values()).flat()
      );

      if (intersects.length > 0) {
        this.selectedObject = intersects[0].object;

        // 将选中对象附加到变换控制器
        this.transformControls.attach(this.selectedObject);
      } else {
        // 如果没有选中，清除变换控制器
        this.transformControls.detach();
        this.selectedObject = null;
      }

      this.render();
    });
  }

  // 添加数据
  addData({ type, data, layer = 'default', options = {} }) {
    let object;

    switch (type) {
      case 'points': // 点数据
        object = this._createPointCloud(data, options);
        break;

      case 'indices': // 索引数据
        object = this._createIndexedMesh(data, options);
        break;

      case 'model': // 模型文件
        this._loadModel(data, layer, options);
        return;

      case 'custom': // 自定义渲染
        object = options.renderFunction?.(data, THREE);
        break;
            case 'triangleMesh': // 三角面数据
              object = this._createTriangleMesh(data, options);
              break;
      default:
        console.warn('Unsupported data type:', type);
        return;
    }

    // 添加对象到场景并分层管理
    this._addToLayer(layer, object);
  }

  // 移除数据
  removeData(layer) {
    if (this.dataLayers.has(layer)) {
      const objects = this.dataLayers.get(layer);
      objects.forEach((obj) => {
        this.scene.remove(obj);

        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
      this.dataLayers.delete(layer);
    }
  }
  render() {
    this.renderer.render(this.scene, this.camera);
  }
// 创建三角面网格
_createTriangleMesh({ vertices, indices }, { color = 0xffffff }) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    geometry.setIndex(indices);

    const material = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide, // 双面渲染
    });

    return new THREE.Mesh(geometry, material);
  }

  // 更新数据
  updateData(layer, newData, options = {}) {
    this.removeData(layer);
    this.addData({ type: options.type, data: newData, layer, options });
  }

  // 创建点云
  _createPointCloud(points, { color = 0x00ff00, size = 0.1 }) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    const material = new THREE.PointsMaterial({ color, size });
    return new THREE.Points(geometry, material);
  }

  // 创建索引数据
  _createIndexedMesh({ vertices, indices }, { color = 0xffffff }) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    geometry.setIndex(indices);

    const material = new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
    });
    return new THREE.Mesh(geometry, material);
  }

  // 加载模型
  _loadModel(url, layer, { scale = 1 }) {
    this.loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(scale, scale, scale);
        this._addToLayer(layer, model);
      },
      undefined,
      (error) => console.error('Error loading model:', error)
    );
  }

  // 添加对象到指定层
  _addToLayer(layer, object) {
    if (!this.dataLayers.has(layer)) {
      this.dataLayers.set(layer, []);
    }
    this.dataLayers.get(layer).push(object);
    this.scene.add(object);
  }

  // 处理窗口大小变化
  onWindowResize() {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  // 清理资源
  dispose() {
    cancelAnimationFrame(this.animationId);

    this.renderer.dispose();
    this.dataLayers.forEach((objects) => {
      objects.forEach((obj) => {
        this.scene.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
    });
    this.dataLayers.clear();

    this.controls.dispose();
    this.transformControls.dispose();

    this.scene = null;
    this.camera = null;
    this.renderer = null;
  }
}

export default SceneManager;