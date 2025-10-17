import City from "../models/cityModel.js";

// Create a new city
export const createCity = async (req, res) => {
    try {
        const { name, state } = req.body;

        // Validate required fields
        if (!name || !state) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: name and state'
            });
        }

 
        const city = new City({
            name: name.trim(),
            state
        });

        await city.save();

        // Populate the state information
        const populatedCity = await City.findById(city._id).populate('state', 'name code');

        res.status(201).json({
            status: 'success',
            message: 'City created successfully',
            data: populatedCity
        });
    } catch (error) {
        console.error('Error creating city:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                status: 'error',
                message: 'Validation error',
                errors: errors
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                status: 'error',
                message: 'Duplicate city found'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all cities
export const getAllCities = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = 'name',
            sortOrder = 'asc',
            search,
            state
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build filter object
        const filter = {};
        
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        if (state) {
            filter.state = state;
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const cities = await City.find(filter)
            .populate('state', 'name code')
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        const total = await City.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum);

        res.status(200).json({
            status: 'success',
            message: 'Cities fetched successfully',
            data: cities,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalRecords: total,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            }
        });
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch cities',
            error: error.message
        });
    }
};

// Get city by ID
export const getCityById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: 'error',
                message: 'City ID is required'
            });
        }

        const city = await City.findById(id).populate('state', 'name code');

        if (!city) {
            return res.status(404).json({
                status: 'error',
                message: 'City not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'City fetched successfully',
            data: city
        });
    } catch (error) {
        console.error('Error fetching city:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid city ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch city',
            error: error.message
        });
    }
};

// Update city
export const updateCity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, state } = req.body;

        if (!id) {
            return res.status(400).json({
                status: 'error',
                message: 'City ID is required'
            });
        }

        // Check if city exists
        const existingCity = await City.findById(id);
        if (!existingCity) {
            return res.status(404).json({
                status: 'error',
                message: 'City not found'
            });
        }

        // Check for duplicate city name in the same state
        if (name && state) {
            const duplicateCity = await City.findOne({
                _id: { $ne: id },
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                state
            });

            if (duplicateCity) {
                return res.status(400).json({
                    status: 'error',
                    message: 'City already exists in this state'
                });
            }
        }

        const updateData = {};
        if (name) updateData.name = name.trim();
        if (state) updateData.state = state;

        // Remove immutable fields
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        const updatedCity = await City.findByIdAndUpdate(
            id,
            { $set: updateData },
            { 
                new: true, 
                runValidators: true,
                context: 'query'
            }
        ).populate('state', 'name code');

        res.status(200).json({
            status: 'success',
            message: 'City updated successfully',
            data: updatedCity
        });
    } catch (error) {
        console.error('Error updating city:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                status: 'error',
                message: 'Validation error',
                errors: errors
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid city ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to update city',
            error: error.message
        });
    }
};

// Delete city
export const deleteCity = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: 'error',
                message: 'City ID is required'
            });
        }

        const deletedCity = await City.findByIdAndDelete(id);

        if (!deletedCity) {
            return res.status(404).json({
                status: 'error',
                message: 'City not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'City deleted successfully',
            data: {
                id: deletedCity._id,
                name: deletedCity.name
            }
        });
    } catch (error) {
        console.error('Error deleting city:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid city ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to delete city',
            error: error.message
        });
    }
};

// Get cities by state ID
export const getCitiesByState = async (req, res) => {
    try {
        const { stateId } = req.params;

        if (!stateId) {
            return res.status(400).json({
                status: 'error',
                message: 'State ID is required'
            });
        }

        const cities = await City.find({ state: stateId })
            .populate('state', 'name code')
            .sort({ name: 1 });

        res.status(200).json({
            status: 'success',
            message: 'Cities fetched successfully',
            data: cities
        });
    } catch (error) {
        console.error('Error fetching cities by state:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid state ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch cities',
            error: error.message
        });
    }
};

// Bulk create cities
export const bulkCreateCities = async (req, res) => {
    try {
        const { cities } = req.body;

        if (!cities || !Array.isArray(cities) || cities.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Cities array is required'
            });
        }

        // Validate each city
        const validCities = [];
        const errors = [];

        for (let i = 0; i < cities.length; i++) {
            const city = cities[i];
            
            if (!city.name || !city.state) {
                errors.push(`City at index ${i}: Missing name or state`);
                continue;
            }

            // Check for duplicates in the batch
            const isDuplicateInBatch = validCities.some(
                c => c.name.toLowerCase() === city.name.toLowerCase() && 
                     c.state.toString() === city.state.toString()
            );

            if (isDuplicateInBatch) {
                errors.push(`City at index ${i}: Duplicate city in batch`);
                continue;
            }

            // Check for existing cities in database
            const existingCity = await City.findOne({
                name: { $regex: new RegExp(`^${city.name}$`, 'i') },
                state: city.state
            });

            if (existingCity) {
                errors.push(`City at index ${i}: '${city.name}' already exists in this state`);
                continue;
            }

            validCities.push({
                name: city.name.trim(),
                state: city.state
            });
        }

        if (validCities.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No valid cities to create',
                errors: errors
            });
        }

        const createdCities = await City.insertMany(validCities);
        
        // Populate the created cities
        const populatedCities = await City.find({
            _id: { $in: createdCities.map(c => c._id) }
        }).populate('state', 'name code');

        res.status(201).json({
            status: 'success',
            message: `Successfully created ${createdCities.length} cities`,
            data: populatedCities,
            errors: errors.length > 0 ? errors : undefined,
            summary: {
                total: cities.length,
                created: createdCities.length,
                failed: errors.length
            }
        });
    } catch (error) {
        console.error('Error bulk creating cities:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                status: 'error',
                message: 'Validation error',
                errors: errors
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to bulk create cities',
            error: error.message
        });
    }
};

// Search cities
export const searchCities = async (req, res) => {
    try {
        const { query, state } = req.query;

        if (!query) {
            return res.status(400).json({
                status: 'error',
                message: 'Search query is required'
            });
        }

        const searchFilter = {
            name: { $regex: query, $options: 'i' }
        };

        if (state) {
            searchFilter.state = state;
        }

        const cities = await City.find(searchFilter)
            .populate('state', 'name code')
            .sort({ name: 1 })
            .limit(20);

        res.status(200).json({
            status: 'success',
            message: 'Cities search completed successfully',
            data: cities
        });
    } catch (error) {
        console.error('Error searching cities:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to search cities',
            error: error.message
        });
    }
};

// Get cities statistics
export const getCityStats = async (req, res) => {
    try {
        const totalCities = await City.countDocuments();
        
        const citiesPerState = await City.aggregate([
            {
                $group: {
                    _id: '$state',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'states',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'stateInfo'
                }
            },
            {
                $unwind: '$stateInfo'
            },
            {
                $project: {
                    stateName: '$stateInfo.name',
                    cityCount: '$count'
                }
            },
            {
                $sort: { cityCount: -1 }
            }
        ]);

        res.status(200).json({
            status: 'success',
            message: 'City statistics fetched successfully',
            data: {
                totalCities,
                citiesPerState
            }
        });
    } catch (error) {
        console.error('Error fetching city statistics:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch city statistics',
            error: error.message
        });
    }
};

// Get cities with pagination and advanced filtering
export const getCitiesAdvanced = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = 'name',
            sortOrder = 'asc',
            search,
            state,
            startDate,
            endDate
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build filter object
        const filter = {};
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { 'state.name': { $regex: search, $options: 'i' } }
            ];
        }

        if (state) {
            filter.state = state;
        }

        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const cities = await City.find(filter)
            .populate('state', 'name code')
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        const total = await City.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum);

        res.status(200).json({
            status: 'success',
            message: 'Cities fetched successfully',
            data: cities,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalRecords: total,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            },
            filters: {
                search: search || '',
                state: state || '',
                dateRange: {
                    start: startDate || '',
                    end: endDate || ''
                }
            }
        });
    } catch (error) {
        console.error('Error fetching cities with advanced filters:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch cities',
            error: error.message
        });
    }
};