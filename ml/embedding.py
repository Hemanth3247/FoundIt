import torch
import torchvision.transforms as transforms
from PIL import Image
from torchvision import models
import torch.nn.functional as F

model = models.resnet50(pretrained=True)
model.eval()

model = torch.nn.Sequential(*list(model.children())[:-1])

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

def get_embedding(img_path):
    img = Image.open(img_path).convert("RGB")
    img = transform(img).unsqueeze(0)

    with torch.no_grad():
        emb = model(img)
    
    return emb.flatten()