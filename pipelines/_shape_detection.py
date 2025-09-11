import cv2
import numpy as np
import sys, os

PATH = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(1, os.path.abspath(f"{PATH}/../"))

from pipeoptz import Pipeline, Node, IntParameter, FloatParameter, ChoiceParameter

def to_grayscale(image, mode='max_rgb'):
    if mode == 'average':
        return np.mean(image, axis=2).astype(np.uint8)
    elif mode == 'weighted_rgb':
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    elif mode == 'max_rgb':
        return np.max(image, axis=2).astype(np.uint8)
    else:
        raise ValueError(f"Unknown grayscale mode: {mode}")

def odd_intenger(n):
    return 2*n-1

def gaussian_blur(image, kernel_size=5):
    return cv2.GaussianBlur(image, (kernel_size, kernel_size), 0)

def canny_edge(image, threshold1=50, threshold2=150):
    return cv2.Canny(image, threshold1, threshold2)

def find_contours(image):
    contours, _ = cv2.findContours(image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    return contours

def draw_shapes_on_image(image, contours, approx_factor=0.04, min_area=50):
    output_image = image.copy() #np.ones(image.shape, dtype=np.uint8)*255
    shapes = []
    for c in contours:
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, approx_factor*peri, True)
        if cv2.contourArea(c) < min_area ** (1 if len(approx) != 2 else 0.5):
                continue
        if 2<= len(approx) <= 4:
            shapes.append(approx)
            cv2.drawContours(output_image, [approx], -1, (0, 0, 255, 255), 1)
        else:
            (x,y),radius = cv2.minEnclosingCircle(c)
            shapes.append([(x, y), radius])
            cv2.circle(output_image,(int(x),int(y)),int(radius),(0, 0, 255, 255),1)
    return output_image, shapes

def initPipeline():
    pipeline = Pipeline("ShapeDetection")
    pipeline.add_node(
        Node("Grayscale", to_grayscale, {"mode": "average"}),
        predecessors={"image": "run_params:image"}
    )
    pipeline.add_node(
        Node("[optz]OddKernelSize", odd_intenger, {"n": 3})
    )
    pipeline.add_node(
        Node("GaussianBlur", gaussian_blur),
        predecessors={"image": "Grayscale", "kernel_size": "[optz]OddKernelSize"}
    )
    pipeline.add_node(
        Node("CannyEdge", canny_edge, {"threshold1": 50, "threshold2": 150}),
        predecessors={"image": "GaussianBlur"}
    )
    pipeline.add_node(
        Node("FindContours", find_contours),
        predecessors={"image": "CannyEdge"}
    )
    pipeline.add_node(
        Node("DrawShapes", draw_shapes_on_image, {"approx_factor": 0.04, "min_area": 100}),
        predecessors={"image": "run_params:image", "contours": "FindContours"}
    )
    return pipeline

def initParameters():
    return [
        ChoiceParameter("Grayscale", "mode", ['max_rgb', 'average', 'weighted_rgb']),
        IntParameter("[optz]OddKernelSize", "n", 1, 5),
        IntParameter("CannyEdge", "threshold1", 10, 200),
        IntParameter("CannyEdge", "threshold2", 10, 200),
        FloatParameter("DrawShapes", "approx_factor", 0.01, 0.1),
        IntParameter("DrawShapes", "min_area", 10, 1000)
    ]

if __name__ == '__main__':
    import matplotlib.pyplot as plt
    # Create a dummy image for testing
    test_image = np.zeros((512, 512, 3), dtype=np.uint8)
    # Draw a rectangle
    cv2.rectangle(test_image, (100, 100), (200, 200), (255, 0, 0), -1)
    # Draw a triangle
    pts = np.array([[250, 100], [350, 200], [250, 200]], np.int32)
    pts = pts.reshape((-1, 1, 2))
    cv2.fillPoly(test_image,[pts],(0,0,255))
    # Draw a circle
    cv2.circle(test_image, (400, 300), 50, (0, 255, 0), -1)

    pipeline = initPipeline()
    last_node_id, history, exec_time = pipeline.run({"image": test_image})
    result_image = history[last_node_id][0][0]

    plt.imshow(result_image)
    plt.show()