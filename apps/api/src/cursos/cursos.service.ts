import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { ModulosService } from './modulos.service';
import { ProgresoService } from './progreso.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';
import { CreateLeccionDto } from './dto/create-leccion.dto';
import { UpdateLeccionDto } from './dto/update-leccion.dto';
import { CompletarLeccionDto } from './dto/completar-leccion.dto';

/**
 * Main service for managing courses
 *
 * This service acts as a facade that delegates to specialized services:
 * - ModulosService: Handles modules and lessons management
 * - ProgresoService: Handles student progress tracking
 *
 * Implements Ed-Tech best practices:
 * - Progressive Disclosure (sequential unlocking)
 * - Learning Analytics (detailed tracking)
 * - Gamification (points and achievements)
 * - Microlearning (short lessons)
 */
@Injectable()
export class CursosService {
  constructor(
    private prisma: PrismaService,
    private modulosService: ModulosService,
    private progresoService: ProgresoService,
  ) {}

  // ============================================================================
  // MÓDULOS - Delegated to ModulosService
  // ============================================================================

  /**
   * Create a new module within a course
   */
  async createModulo(productoId: string, createModuloDto: CreateModuloDto) {
    return this.modulosService.createModulo(productoId, createModuloDto);
  }

  /**
   * Get all modules of a course
   */
  async findModulosByProducto(productoId: string) {
    return this.modulosService.findModulosByProducto(productoId);
  }

  /**
   * Get a specific module with its lessons
   */
  async findOneModulo(id: string) {
    return this.modulosService.findOneModulo(id);
  }

  /**
   * Update a module
   */
  async updateModulo(id: string, updateModuloDto: UpdateModuloDto) {
    return this.modulosService.updateModulo(id, updateModuloDto);
  }

  /**
   * Delete a module (and its lessons by cascade)
   */
  async removeModulo(id: string) {
    return this.modulosService.removeModulo(id);
  }

  /**
   * Reorder modules of a course
   */
  async reordenarModulos(productoId: string, ordenIds: string[]) {
    return this.modulosService.reordenarModulos(productoId, ordenIds);
  }

  // ============================================================================
  // LECCIONES - Delegated to ModulosService
  // ============================================================================

  /**
   * Create a new lesson within a module
   */
  async createLeccion(moduloId: string, createLeccionDto: CreateLeccionDto) {
    return this.modulosService.createLeccion(moduloId, createLeccionDto);
  }

  /**
   * Get all lessons of a module
   */
  async findLeccionesByModulo(moduloId: string) {
    return this.modulosService.findLeccionesByModulo(moduloId);
  }

  /**
   * Get a specific lesson with all its content
   */
  async findOneLeccion(id: string) {
    return this.modulosService.findOneLeccion(id);
  }

  /**
   * Update a lesson
   */
  async updateLeccion(id: string, updateLeccionDto: UpdateLeccionDto) {
    return this.modulosService.updateLeccion(id, updateLeccionDto);
  }

  /**
   * Delete a lesson
   */
  async removeLeccion(id: string) {
    return this.modulosService.removeLeccion(id);
  }

  /**
   * Reorder lessons of a module
   */
  async reordenarLecciones(moduloId: string, ordenIds: string[]) {
    return this.modulosService.reordenarLecciones(moduloId, ordenIds);
  }

  // ============================================================================
  // PROGRESO DEL ESTUDIANTE - Delegated to ProgresoService
  // ============================================================================

  /**
   * Complete a lesson (student action)
   * Implements:
   * - Immediate Feedback
   * - Gamification (award points)
   * - Learning Analytics (save time, score)
   * - Unlock achievements
   */
  async completarLeccion(
    leccionId: string,
    estudianteId: string,
    completarDto: CompletarLeccionDto,
  ) {
    return this.progresoService.completarLeccion(
      leccionId,
      estudianteId,
      completarDto,
    );
  }

  /**
   * Get student progress in a complete course
   */
  async getProgresoCurso(productoId: string, estudianteId: string) {
    return this.progresoService.getProgresoCurso(productoId, estudianteId);
  }

  /**
   * Get the next available lesson for a student
   * Implements Progressive Disclosure (one lesson at a time)
   */
  async getSiguienteLeccion(productoId: string, estudianteId: string) {
    return this.progresoService.getSiguienteLeccion(productoId, estudianteId);
  }
}
