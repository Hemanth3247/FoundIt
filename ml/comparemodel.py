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

def compare(img1, img2):
    emb1 = get_embedding(img1)
    emb2 = get_embedding(img2)
    
    similarity = F.cosine_similarity(emb1, emb2, dim=0)
    return similarity.item()

score = compare("key1.jpg", "key1.jpg")
print("Similarity:", score)
