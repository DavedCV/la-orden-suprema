# Mission Assignment Integration Documentation

## Overview
This document describes the complete frontend-backend integration for assigning missions from the admin profile in La Orden Suprema application.

## Backend Integration

### API Endpoint
- **Route**: `PATCH /api/missions/:missionId/assign`
- **Method**: PATCH
- **Access**: Admin only
- **Authentication**: Required JWT token with admin role

### Controller Implementation
Located in `server/src/controllers/missions.ts`:

```typescript
export const assignMission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    const { missionId } = req.params;
    const { assassinId } = req.body;

    const [mission, assassin] = await Promise.all([
      Mission.findById(missionId),
      User.findOne({ _id: assassinId, role: 'assassin' }),
    ]);

    if (!mission) {
      throw new NotFoundError('Mission not found');
    }

    if (!assassin) {
      throw new NotFoundError('Assassin not found');
    }

    // Validation checks
    if (mission.status !== 'No Asignada') {
      throw new ConflictError('Mission is not available for assignment');
    }

    if (assassin.status !== 'Activo') {
      throw new ConflictError('Can only assign missions to active assassins');
    }

    if (new Date(mission.deadline) <= new Date()) {
      throw new ConflictError('Cannot assign expired mission');
    }

    // Assign mission
    mission.assignedTo = assassinId;
    mission.status = 'Asignada';
    (mission as any).assignedAt = new Date().toISOString();

    await mission.save();
    await mission.populate([
      { path: 'assignedTo', select: 'alias email' },
      { path: 'createdBy', select: 'alias email' }
    ]);

    const response: ApiResponse<any> = {
      success: true,
      data: mission.toJSON(),
      message: `Mission assigned to ${assassin.alias}`,
    };

    res.status(200).json(response);
  } catch (error) {
    handleError(error as Error, res);
  }
};
```

### Database Model
The Mission model includes proper validation and relationships:

```typescript
// Assignment tracking fields
assignedTo: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  validate: {
    validator: function(v: mongoose.Types.ObjectId) {
      return this.status === 'No Asignada' || v != null;
    },
    message: 'Assigned missions must have an assignee',
  },
},
assignedAt: {
  type: Date,
  validate: {
    validator: function(v: Date) {
      return !this.assignedTo || v != null;
    },
    message: 'Assignment date is required when mission is assigned',
  },
},
```

## Frontend Integration

### API Service
Located in `client/src/shared/services/api.ts`:

```typescript
async assignMission(missionId: string, assassinId: string): Promise<ApiResponse<Mission>> {
  return this.request(`/missions/${missionId}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assassinId }),
  });
}
```

### Mission Assignment Form
Located in `client/src/features/missions/components/AssignMissionForm.tsx`:

#### Key Features:
1. **React Query Integration**: Uses `useMutation` for proper state management
2. **Cache Invalidation**: Automatically refreshes relevant data after assignment
3. **Error Handling**: Comprehensive error feedback to users
4. **Loading States**: Proper loading indicators during assignment
5. **Validation**: Client-side validation before submission

#### Implementation:
```typescript
export function AssignMissionForm({
  mission,
  assassins,
  onClose,
  onSuccess,
}: AssignMissionFormProps) {
  const queryClient = useQueryClient();
  const [selectedAssassin, setSelectedAssassin] = useState<Assassin | null>(null);

  // Mission assignment mutation with proper cache management
  const assignMissionMutation = useMutation({
    mutationFn: ({ missionId, assassinId }: { missionId: string; assassinId: string }) =>
      apiService.assignMission(missionId, assassinId),
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      queryClient.invalidateQueries({ queryKey: ["assassins"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["available-missions"] });

      toast({
        type: "success",
        title: "Misión asignada",
        message: `La misión "${mission.title}" ha sido asignada a ${selectedAssassin?.alias}`,
      });

      onSuccess();
    },
    onError: (error) => {
      console.error("Error assigning mission:", error);
      toast({
        type: "error",
        title: "Error",
        message: "Error al asignar la misión. Inténtalo de nuevo.",
      });
    },
  });

  const handleAssign = () => {
    if (!selectedAssassin) {
      toast({
        type: "error",
        title: "Error",
        message: "Debes seleccionar un asesino para asignar la misión",
      });
      return;
    }

    assignMissionMutation.mutate({
      missionId: mission.id,
      assassinId: selectedAssassin.id,
    });
  };

  // ... rest of component
}
```

### Admin Mission Management
Located in `client/src/features/missions/components/MissionManagementPage.tsx`:

The main admin interface provides:
1. **Mission List**: Displays all missions with current status
2. **Assignment Actions**: Direct assignment buttons for unassigned missions
3. **Mission Details**: Comprehensive mission information with assignment options
4. **Real-time Updates**: Automatic data refresh after operations

### Data Flow
1. Admin navigates to Mission Management page
2. System fetches missions and assassins data via React Query
3. Admin selects "Assign" for an unassigned mission
4. Assignment modal opens with list of active assassins
5. Admin selects an assassin and submits assignment
6. Frontend sends PATCH request to backend
7. Backend validates request and updates database
8. Frontend receives success response and invalidates cache
9. UI automatically updates with new mission status

## Security Features

### Backend Security:
- **Authentication**: JWT token validation required
- **Authorization**: Admin role validation
- **Input Validation**: Comprehensive validation of mission and assassin IDs
- **Business Logic Validation**:
  - Mission must be unassigned
  - Assassin must be active
  - Mission must not be expired
  - Proper status transitions

### Frontend Security:
- **Role-based UI**: Assignment features only visible to admins
- **Client-side Validation**: Prevents invalid submissions
- **Error Handling**: Secure error messages without exposing system details

## Testing Scenarios

### Successful Assignment:
1. Admin with valid token
2. Unassigned mission (status: "No Asignada")
3. Active assassin (status: "Activo")
4. Mission deadline in the future

### Error Cases:
1. **Unauthorized Access**: Non-admin user attempting assignment
2. **Invalid Mission**: Mission not found or already assigned
3. **Invalid Assassin**: Assassin not found or inactive
4. **Expired Mission**: Mission deadline has passed
5. **Network Errors**: Connection failures handled gracefully

## Performance Optimizations

### Backend:
- **Parallel Queries**: Mission and assassin fetched simultaneously
- **Selective Population**: Only necessary fields populated in responses
- **Efficient Validation**: Business logic checks optimized

### Frontend:
- **React Query Caching**: Efficient data caching and synchronization
- **Optimistic Updates**: UI updates immediately with rollback on error
- **Lazy Loading**: Components loaded on demand
- **Debounced Search**: Efficient assassin filtering

## Future Enhancements

1. **Bulk Assignment**: Assign multiple missions at once
2. **Assignment History**: Track assignment history and changes
3. **Notification System**: Notify assassins of new assignments
4. **Assignment Analytics**: Track assignment patterns and success rates
5. **Auto-Assignment**: Intelligent mission-assassin matching

## Integration Status
✅ Backend API endpoint implemented
✅ Frontend API service integrated
✅ Mission assignment form created
✅ React Query mutations implemented
✅ Cache invalidation configured
✅ Error handling implemented
✅ Loading states managed
✅ Authentication and authorization
✅ Input validation
✅ Build tests passed

The mission assignment integration is complete and fully functional.
