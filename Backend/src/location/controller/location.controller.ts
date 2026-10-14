
import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { LocationService } from '../services/location.service';


@Controller('location')
export class LocationController {
  constructor(
    private readonly locationService: LocationService,
  ) {}

  // Get Indian states (country_id = 101)
  @Get('states')
  states() {
    return this.locationService.states();
  }

  // Get cities by state ID
  @Get('cities/:state_id')
  cities(
    @Param('state_id', ParseIntPipe) stateId: number,
  ) {
    return this.locationService.cities(stateId);
  }

  // Search cities by name
  @Get('search-cities')
  searchCities(@Query('q') q?: string) {
    return this.locationService.searchCities(q);
  }
}
