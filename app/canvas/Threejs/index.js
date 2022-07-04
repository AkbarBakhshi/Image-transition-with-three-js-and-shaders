import * as THREE from 'three'
import gsap from 'gsap'

import vertex from 'shaders/vertex.glsl'
import fragment from 'shaders/fragment.glsl'

export default class {
    constructor() {

        this.threejsCanvas = document.querySelector('.threejs__canvas__container')
        this.width = this.threejsCanvas.offsetWidth
        this.height = this.threejsCanvas.offsetHeight

        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
        this.camera.position.set(0, 0, 12)
        this.camera.lookAt(0, 0, 0)

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        })

        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.threejsCanvas.appendChild(this.renderer.domElement)

        this.raycaster = new THREE.Raycaster()

        this.mouse = new THREE.Vector2()

        this.loadTextures()

    }

    loadTextures() {

        const textureLoader = new THREE.TextureLoader()
        const logo1 = textureLoader.load('images/textures/LNC-purple.png')
        const logo2 = textureLoader.load('images/textures/LNC-pink.png')

        this.planeGeometry = new THREE.PlaneBufferGeometry(8, 8, 100, 1)
        this.planeMaterial = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms:
            {
                uHoverState: { value: 0 },
                uLogo1Texture: { value: logo1 },
                uLogo2Texture: { value: logo2 },
                uDisp: {
                    value: textureLoader.load('https://images.unsplash.com/photo-1517431397609-ab159afd52ed?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ')
                }
            }
        })
        this.plane = new THREE.Mesh(this.planeGeometry, this.planeMaterial)

        this.scene.add(this.plane)
        
    }


    onMouseDown() {
    }

    onMouseUp() {
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / this.width) * 2 - 1
        this.mouse.y = - (event.clientY / this.height) * 2 + 1

        this.raycaster.setFromCamera(this.mouse, this.camera)

        const objects = [this.plane]
        this.intersects = this.raycaster.intersectObjects(objects)

        if (this.intersects.length > 0) {
            gsap.to(this.planeMaterial.uniforms.uHoverState, {
                value: 1
            })
        } else {
            gsap.to(this.planeMaterial.uniforms.uHoverState, {
                value: 0
            })
        }
        
    }

    update() {
        this.renderer.render(this.scene, this.camera)
    }


    onResize() {
        this.width = this.threejsCanvas.offsetWidth
        this.height = this.threejsCanvas.offsetHeight

        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        this.camera.aspect = this.width / this.height
        this.camera.updateProjectionMatrix()

    }

    /**
     * Destroy.
     */
    destroy() {
        this.destroyThreejs(this.scene)
    }

    destroyThreejs(obj) {
        while (obj.children.length > 0) {
            this.destroyThreejs(obj.children[0]);
            obj.remove(obj.children[0]);
        }
        if (obj.geometry) obj.geometry.dispose();

        if (obj.material) {
            //in case of map, bumpMap, normalMap, envMap ...
            Object.keys(obj.material).forEach(prop => {
                if (!obj.material[prop])
                    return;
                if (obj.material[prop] !== null && typeof obj.material[prop].dispose === 'function')
                    obj.material[prop].dispose();
            })
            // obj.material.dispose();
        }
    }
}