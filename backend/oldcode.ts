// async create(req: AuthRequest) {

//     const user = req.user ? await this.userRepository.findOne({ where: { id: req.user.id } }) : null;
//     if (!user) throw new Error("User not found");

//     if (user.role !== "admin") throw new Error("User not an admin")

//     const data = req.body
//     const file = req?.file

//     const category = data.category ? await this.categoryRepository.findOne({ where: { id: data.category } }) : null;
//     if (!category) throw new Error("Category not found");

//     if (!file) throw new Error("File not found")
    
//     const tagsId = data.tagsId ? JSON.parse(data.tagsId) : null;
//     const tag = data.tagsId ? await this.tagRepository.findBy({ id: In(tagsId) }) : null;
//     if (!tag) throw new Error("Tag not found");
//     const d = {
//         name: data.name,
//         description: data.description,
//         price: data.price,
//         user,
//         category,
//         tags:  tag
//     }

//     const asset = this.assetRepository.create(d);

//     let filePath = null;
  
//     if (file) {
     
//         const uploadsDir = path.join(__dirname, '../../uploads/main');
//         const thumbnailDir = path.join(__dirname, '../../uploads/thumbnail');
//         if (!fs.existsSync(uploadsDir)) {
//             fs.mkdirSync(uploadsDir, { recursive: true });
//         }
//         if (!fs.existsSync(thumbnailDir)) {
//             fs.mkdirSync(thumbnailDir, { recursive: true });
//         }
//         const thumbnail = await convertToWebP(file)

//         const asset_name = uuidv4()

//         const file_ext = file.originalname ? path.extname(file.originalname) : '';
//         const fileName = `${asset_name}${file_ext}`;
//         filePath = path.join(uploadsDir, fileName);
//         console.log(fileName, filePath)

//         if (Buffer.isBuffer(file.buffer)) {
//             fs.writeFileSync(filePath, file.buffer);
//         } else if (typeof file === 'string') {
//             fs.writeFileSync(filePath, Buffer.from(file, 'base64'));
//         } else {
//             throw new Error('Invalid file format');
//         }

//         const thumbnailName = `${asset_name}.webp`
//         const thumbnailPath = path.join(thumbnailDir, thumbnailName);
        
//         if (Buffer.isBuffer(thumbnail.buffer)) {
//             fs.writeFileSync(thumbnailPath, thumbnail.buffer);
//         } else if (typeof file === 'string') {
//             fs.writeFileSync(thumbnailPath, Buffer.from(file, 'base64'));
//         } else {
//             throw new Error('Invalid file format');
//         }


//         asset.file_url = filePath;
//         asset.thumbnail_url = thumbnailPath
//     }
//     const savedAsset = await this.assetRepository.save(asset);

//     return savedAsset;
//  }