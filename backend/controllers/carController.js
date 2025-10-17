import Car from '../models/carModel.js';


// Create a new car
export const createCar = async (req, res) => {
    try {
        const { brand, model, variant, color, carType, manufacturingYear, registrationYear, numberOfOwners, kilometersDriven, fuelType, registrationState, registrationNumber, insuranceValidity, insuranceType, warrantyValidity, status, askingPrice } = req.body;

        console.log('Request Body:', req.body);

        if (!brand || !model || !variant || !color || !carType || !manufacturingYear || !registrationYear || !numberOfOwners || !kilometersDriven || !fuelType || !registrationState || !registrationNumber || !insuranceValidity || !insuranceType || !warrantyValidity || !status || !askingPrice) {
            return res.status(400).json({ message: 'All required fields must be filled.' });
        }

        // Check if a car with the same registration number already exists
        const existingCar = await Car.findOne({ registrationNumber });
        if (existingCar) {
            return res.status(400).json({ message: 'A car with this registration number already exists.' });
        }

        console.log('Files by field:', req.filesByField);

        // Get files from the processed files by field
        const carImages = req.filesByField?.carImages || [];
        const carDocuments = req.filesByField?.carDocuments || [];

        console.log('Uploaded Car Images:', carImages);
        console.log('Uploaded Car Documents:', carDocuments);

        const newCar = new Car({
            brand,
            model,
            variant,
            color,
            carType,
            manufacturingYear,
            registrationYear,
            numberOfOwners,
            kilometersDriven,
            fuelType,
            registrationState,
            registrationNumber,
            insuranceValidity,
            insuranceType,
            warrantyValidity,
            status,
            askingPrice,
            photos: carImages.map(img => img.fileUrl),
            documents: carDocuments.map(doc => doc.fileUrl)
        });

        await newCar.save();
        res.status(201).json({ status: 'success', message: 'Car created successfully', car: newCar });
    } catch (error) {
        console.error('Error creating car:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Get all cars
// export const getAllCars = async (req, res) => {
//     try {
//         // Get query parameters with default values
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const sortBy = req.query.sortBy || 'createdAt';
//         const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
//         const search = req.query.search || '';
        
//         // Calculate skip value for pagination
//         const skip = (page - 1) * limit;
        
//         // Build search filter
//         let filter = {};
        
//         // Global search across multiple fields
//         if (search) {
//             filter.$or = [
//                 { brand: { $regex: search, $options: 'i' } },
//                 { model: { $regex: search, $options: 'i' } },
//                 { variant: { $regex: search, $options: 'i' } },
//                 { registrationNumber: { $regex: search, $options: 'i' } },
//                 { color: { $regex: search, $options: 'i' } },
//                 { carType: { $regex: search, $options: 'i' } },
//                 { manufacturingYear: { $regex: search, $options: 'i' } },
//                 { registrationYear: { $regex: search, $options: 'i' } },
//                 { fuelType: { $regex: search, $options: 'i' } },
//                 { registrationState: { $regex: search, $options: 'i' } },
//                 { insuranceType: { $regex: search, $options: 'i' } },
//                 { status: { $regex: search, $options: 'i' } }
//             ];
//         }
        
//         // Add column-specific filters
//         const columnFilters = {};
//         Object.keys(req.query).forEach(key => {
//             // Exclude pagination, sorting, and global search parameters
//             if (!['page', 'limit', 'sortBy', 'sortOrder', 'search'].includes(key) && req.query[key]) {
//                 columnFilters[key] = { $regex: req.query[key], $options: 'i' };
//             }
//         });
        
//         // Combine global search and column filters
//         if (Object.keys(columnFilters).length > 0) {
//             if (filter.$or) {
//                 // If we have both global search and column filters, use $and to combine them
//                 filter = {
//                     $and: [
//                         { $or: filter.$or },
//                         columnFilters
//                     ]
//                 };
//             } else {
//                 // Only column filters
//                 filter = columnFilters;
//             }
//         }
        
//         // Get total count for pagination info
//         const totalCars = await Car.countDocuments(filter);
        
//         // Get cars with sorting, pagination, and filtering
//         const cars = await Car.find(filter)
//             .sort({ [sortBy]: sortOrder })
//             .skip(skip)
//             .limit(limit);
        
//         // Calculate pagination info
//         const totalPages = Math.ceil(totalCars / limit);
//         const hasNextPage = page < totalPages;
//         const hasPrevPage = page > 1;
        
//         res.status(200).json({
//             status: 'success',
//             data: {
//                 cars,
//                 pagination: {
//                     currentPage: page,
//                     totalPages,
//                     totalCars,
//                     hasNextPage,
//                     hasPrevPage,
//                     limit
//                 }
//             }
//         });
//     } catch (error) {
//         res.status(500).json({ 
//             status: 'error',
//             message: error.message 
//         });
//     }
// };



export const getAllCars = async (req, res) => {
    try {
        // Get query parameters with default values
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
        const search = req.query.search || '';
        
        // Calculate skip value for pagination
        const skip = (page - 1) * limit;
        
        // Build search filter
        let filter = {};
        
        // Global search across multiple fields
        if (search) {
            filter.$or = [
                { 'brand.make': { $regex: search, $options: 'i' } },
                { 'model.name': { $regex: search, $options: 'i' } },
                { 'variant.name': { $regex: search, $options: 'i' } },
                { registrationNumber: { $regex: search, $options: 'i' } },
                { color: { $regex: search, $options: 'i' } },
                { carType: { $regex: search, $options: 'i' } },
                { manufacturingYear: { $regex: search, $options: 'i' } },
                { registrationYear: { $regex: search, $options: 'i' } },
                { fuelType: { $regex: search, $options: 'i' } },
                { registrationState: { $regex: search, $options: 'i' } },
                { insuranceType: { $regex: search, $options: 'i' } },
                { status: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Add column-specific filters
        const columnFilters = {};
        Object.keys(req.query).forEach(key => {
            // Exclude pagination, sorting, and global search parameters
            if (!['page', 'limit', 'sortBy', 'sortOrder', 'search'].includes(key) && req.query[key]) {
                // Handle special cases for populated fields
                if (key === 'brand') {
                    columnFilters['brand._id'] = req.query[key];
                } else if (key === 'model') {
                    columnFilters['model._id'] = req.query[key];
                } else if (key === 'variant') {
                    columnFilters['variant._id'] = req.query[key];
                } else {
                    columnFilters[key] = { $regex: req.query[key], $options: 'i' };
                }
            }
        });
        
        // Combine global search and column filters
        if (Object.keys(columnFilters).length > 0) {
            if (filter.$or) {
                // If we have both global search and column filters, use $and to combine them
                filter = {
                    $and: [
                        { $or: filter.$or },
                        columnFilters
                    ]
                };
            } else {
                // Only column filters
                filter = columnFilters;
            }
        }
        
        // Get total count for pagination info
        const totalCars = await Car.countDocuments(filter);
        
        // Get cars with sorting, pagination, and filtering
        const cars = await Car.find(filter)
            .populate('brand', 'make')
            .populate('model', 'name')
            .populate('variant', 'name')
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);
        
        // Calculate pagination info
        const totalPages = Math.ceil(totalCars / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        
        res.status(200).json({
            status: 'success',
            data: {
                cars,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCars,
                    hasNextPage,
                    hasPrevPage,
                    limit
                }
            }
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
};

// Get a single car by ID
export const getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.status(200).json(car);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a car by ID
export const updateCar = async (req, res) => {
    try {
        const id = req.params.id;
        
        const car = await Car.findById(id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        const { brand, model, variant, color, carType, manufacturingYear, registrationYear, numberOfOwners, kilometersDriven, fuelType, registrationState, registrationNumber, insuranceValidity, insuranceType, warrantyValidity, status, askingPrice } = req.body;
        
        if (!brand || !model || !variant || !color || !carType || !manufacturingYear || !registrationYear || !numberOfOwners || !kilometersDriven || !fuelType || !registrationState || !registrationNumber || !insuranceValidity || !insuranceType || !warrantyValidity || !status || !askingPrice) {
            return res.status(400).json({ message: 'All required fields must be filled.' });
        }
        
        // Handle car images - use new ones if provided, otherwise keep existing
        let carImages = car.photos;
        if (req.filesByField?.carImages && req.filesByField.carImages.length > 0) {
            carImages = req.filesByField.carImages.map(img => img.fileUrl);
        }
        
        // Handle car documents - use new ones if provided, otherwise keep existing
        let carDocuments = car.documents;
        if (req.filesByField?.carDocuments && req.filesByField.carDocuments.length > 0) {
            carDocuments = req.filesByField.carDocuments.map(doc => doc.fileUrl);
        }

        const updatedCar = await Car.findByIdAndUpdate(id, {
            brand,
            model,
            variant,
            color,
            carType,
            manufacturingYear,
            registrationYear,
            numberOfOwners,
            kilometersDriven,
            fuelType,
            registrationState,
            registrationNumber,
            insuranceValidity,
            insuranceType,
            warrantyValidity,
            status,
            photos: carImages,
            documents: carDocuments,
            askingPrice
        }, { new: true });

        if (!updatedCar) {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.status(200).json({ status: 'success', message: 'Car updated successfully', car: updatedCar });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a car by ID
export const deleteCar = async (req, res) => {
    try {
        const deletedCar = await Car.findByIdAndDelete(req.params.id);
        if (!deletedCar) {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.status(200).json({ status: 'success', message: 'Car deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
