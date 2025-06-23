// Debug utilities and simplified pose detection test
class DebugHelper {
    static async testTensorFlowSetup() {
        console.log('🧪 Running TensorFlow.js diagnostic...');
        
        try {
            // Basic TF test
            if (typeof tf === 'undefined') {
                throw new Error('TensorFlow.js not loaded');
            }
            
            console.log('✅ TensorFlow.js version:', tf.version);
            console.log('✅ Backend:', tf.getBackend());
            
            // Test basic tensor operations
            const tensor = tf.tensor2d([[1, 2], [3, 4]]);
            const result = tensor.sum();
            await result.data();
            tensor.dispose();
            result.dispose();
            console.log('✅ Basic tensor operations work');
            
            // Test pose detection availability
            if (typeof poseDetection === 'undefined') {
                throw new Error('Pose Detection library not loaded');
            }
            
            console.log('✅ Pose Detection library loaded');
            console.log('✅ Supported models:', Object.keys(poseDetection.SupportedModels));
            
            return true;
        } catch (error) {
            console.error('❌ TensorFlow setup test failed:', error);
            return false;
        }
    }
    
    static async testSimplePoseDetection() {
        console.log('🧪 Testing simple pose detection...');
        
        try {
            await tf.ready();
            
            // Try to create a simple detector
            const detector = await poseDetection.createDetector(
                poseDetection.SupportedModels.MoveNet,
                {
                    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
                }
            );
            
            console.log('✅ Pose detector created successfully');
            return detector;
        } catch (error) {
            console.error('❌ Simple pose detection test failed:', error);
            return null;
        }
    }
    
    static displaySystemInfo() {
        console.log('🖥️ System Information:');
        console.log('- User Agent:', navigator.userAgent);
        console.log('- Platform:', navigator.platform);
        console.log('- WebGL Support:', typeof WebGLRenderingContext !== 'undefined');
        console.log('- WebGL2 Support:', typeof WebGL2RenderingContext !== 'undefined');
        console.log('- Media Devices Support:', typeof navigator.mediaDevices !== 'undefined');
        
        if (typeof tf !== 'undefined') {
            console.log('- TF Backend:', tf.getBackend());
            console.log('- TF Environment:', tf.env());
        }
    }
}

// Auto-run diagnostics
DebugHelper.displaySystemInfo();
setTimeout(async () => {
    const tfOk = await DebugHelper.testTensorFlowSetup();
    if (tfOk) {
        const detector = await DebugHelper.testSimplePoseDetection();
        if (detector) {
            console.log('🎯 All systems ready for pose detection!');
        }
    }
}, 1000);